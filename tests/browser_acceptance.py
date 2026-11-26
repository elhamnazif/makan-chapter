"""Real-browser acceptance in Chromium. Never sends an enquiry or order: window.open is intercepted.

Serve a build first, e.g.  npm run build && npx astro preview --port 18763
then:                      python tests/browser_acceptance.py   (URL=... to test another host)
"""
import json
import os
from datetime import date, timedelta
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
DIST = ROOT / os.environ.get('DIST', 'dist')
URL = os.environ.get('URL', 'http://127.0.0.1:18763/').rstrip('/') + '/'
OUT = ROOT / 'test-results'
OUT.mkdir(exist_ok=True)
CHROMIUM = os.environ.get('CHROMIUM', '/usr/bin/chromium')
ROUTES = ['' if r == '.' else r + '/' for r in sorted(str(f.parent.relative_to(DIST)) for f in DIST.rglob('index.html'))]
assert ROUTES, f'no pages in {DIST}; run npm run build first'
journeys = []


def theme(page): return page.locator('html').get_attribute('data-theme')
def toggle(page): page.locator('[data-theme-toggle]').click()
def no_overflow(page): return page.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')


def goto(page, path=''):
    response = page.goto(URL + path, wait_until='networkidle')
    assert response.status == 200, (path, response.status)
    page.evaluate('document.fonts.ready')


def lum(hexcolor):
    h = hexcolor.lstrip('#')
    if len(h) == 3: h = ''.join(c * 2 for c in h)
    rgb = [int(h[i:i + 2], 16) / 255 for i in (0, 2, 4)]
    return sum(w * (v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4) for v, w in zip(rgb, (.2126, .7152, .0722)))


def contrast(a, b):
    x, y = sorted([lum(a), lum(b)])
    return (y + .05) / (x + .05)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROMIUM, headless=True, args=['--no-sandbox'])
    context = browser.new_context(viewport={'width': 1440, 'height': 1000}, color_scheme='dark', reduced_motion='reduce')
    page = context.new_page()
    errors = []
    page.on('pageerror', lambda e: errors.append(str(e)))

    # Theme: light default even under OS dark, explicit choice persists across reload and routes.
    goto(page)
    assert theme(page) == 'light', 'light default must not follow OS dark'
    assert page.get_by_role('button', name='Switch to dark mode').get_attribute('aria-pressed') == 'false'
    toggle(page); assert theme(page) == 'dark'
    page.reload(wait_until='networkidle'); assert theme(page) == 'dark'
    goto(page, 'package/indian-cuisine/'); assert theme(page) == 'dark'
    toggle(page); assert theme(page) == 'light'
    page.evaluate('localStorage.removeItem("mc-theme")')
    page.reload(wait_until='networkidle'); assert theme(page) == 'light'
    journeys.append('theme default, toggle, persistence')

    # Keyboard toggle, cross-tab sync and token contrast in both themes.
    other = context.new_page(); goto(other, 'order/')
    for mode in ['light', 'dark']:
        if theme(page) != mode:
            page.locator('[data-theme-toggle]').focus(); page.keyboard.press('Enter')
        other.wait_for_function('(m) => document.documentElement.dataset.theme === m', arg=mode)
        tokens = page.evaluate('''() => { const s = getComputedStyle(document.documentElement);
          return Object.fromEntries(['bg','surface','surface-2','ink','muted','accent','accent-ink','price','note-bg','footer-bg','footer-ink','footer-muted'].map(k => [k, s.getPropertyValue('--mc-' + k).trim()])) }''')
        for fg, bg in [('ink', 'bg'), ('muted', 'bg'), ('muted', 'surface'), ('muted', 'surface-2'), ('accent-ink', 'accent'),
                       ('price', 'surface'), ('muted', 'note-bg'), ('footer-ink', 'footer-bg'), ('footer-muted', 'footer-bg')]:
            ratio = contrast(tokens[fg], tokens[bg])
            assert ratio >= 4.5, (mode, fg, bg, round(ratio, 2))
    other.close()
    page.evaluate('localStorage.removeItem("mc-theme")')
    journeys.append('keyboard toggle, cross-tab sync, text contrast >= 4.5 in both themes')

    # Every page at phone and desktop width in both themes: no overflow, images load, removed features absent.
    for width in [390, 1440]:
        page.set_viewport_size({'width': width, 'height': 844 if width == 390 else 1000})
        for mode in ['light', 'dark']:
            page.evaluate('(m) => localStorage.setItem("mc-theme", m)', mode)
            for route in ROUTES:
                goto(page, route)
                assert theme(page) == mode
                assert no_overflow(page), (width, mode, route)
                page.evaluate('''async () => { await Promise.all([...document.images].filter(i => i.loading !== 'lazy' && i.checkVisibility()).map(i => i.decode().catch(() => {}))) }''')
                bad = page.evaluate('''() => [...document.images].filter(i => i.loading !== 'lazy' && i.checkVisibility() && (!i.complete || i.naturalWidth === 0)).map(i => i.src)''')
                assert not bad, (route, bad)
                assert not page.locator('a[href*="/gift-card/"],a[href*="/loyalty/"]').count()
                if route in ['', 'order/', 'package/indian-cuisine/']:
                    page.screenshot(path=str(OUT / f'{route.strip("/").replace("/", "-") or "home"}-{width}-{mode}.png'), full_page=True)
    page.evaluate('localStorage.removeItem("mc-theme")')
    journeys.append(f'{len(ROUTES)} routes x 2 widths x 2 themes')

    # Muslim-Owned badge follows the site theme, with no backing behind its transparent corners.
    for path in ['', 'order/', 'our-story/']:
        goto(page, path)
        for mode in ['light', 'dark']:
            if theme(page) != mode: toggle(page)
            img = page.locator('[data-moe-badge] img:visible')
            assert img.count() == 1, (path, mode)
            img.scroll_into_view_if_needed()
            v = img.evaluate('''async (image) => { await image.decode(); const c = document.createElement('canvas');
              c.width = image.naturalWidth; c.height = image.naturalHeight; const x = c.getContext('2d'); x.drawImage(image, 0, 0);
              return { src: image.getAttribute('src'), corner: x.getImageData(0, 0, 1, 1).data[3],
                       bg: getComputedStyle(image).backgroundColor, wrap: getComputedStyle(image.parentElement).backgroundColor } }''')
            assert ('dark' in v['src']) == (mode == 'dark'), v
            assert v['corner'] == 0 and v['bg'] == v['wrap'] == 'rgba(0, 0, 0, 0)', v
    page.evaluate('localStorage.removeItem("mc-theme")')
    journeys.append('badge variant follows theme, transparent')

    # Mobile menu.
    page.set_viewport_size({'width': 390, 'height': 844}); goto(page)
    page.locator('[data-drawer-open]').click()
    assert page.locator('[data-drawer]').is_visible()
    assert 'Gift Card' not in page.locator('[data-drawer]').inner_text()
    page.keyboard.press('Escape'); assert page.locator('[data-drawer]').is_hidden()

    # Buffet listing: priority order, no Budget/Guests filters, search, empty state, menu filter in mobile drawer.
    goto(page, 'catering/buffet/')
    def packages(): return page.locator('[data-package]:visible h3').all_text_contents()
    assert packages() == ['Indonesian Nasi Ambeng', 'Kampong Cuisine', 'Indian Cuisine'], packages()
    assert not page.locator('[data-filter="budget"],[data-filter="pax"]').count()
    page.locator('input[data-search]').fill('kampong'); assert packages() == ['Kampong Cuisine']
    page.locator('input[data-search]').fill('zzzzz'); assert page.locator('[data-empty]').is_visible()
    page.locator('[data-filter-reset]').last.click(); assert len(packages()) == 8
    page.locator('[data-filter-open]').click()
    page.locator('[data-filter="menus"][value="buffet"]').check()
    page.get_by_role('button', name='Show results').click()
    assert packages() == ['Indonesian Nasi Ambeng', 'Kampong Cuisine', 'Indian Cuisine']
    journeys.append('buffet listing')

    # Indian/Kampong quotation: group order, date validation, WhatsApp link built (intercepted, never opened).
    page.add_init_script('window.open = (url) => { window.__outgoing = url; return null; }')
    for slug in ['indian-cuisine', 'kampong-cuisine']:
        goto(page, f'package/{slug}/')
        assert page.locator('[data-group]').evaluate_all('(els) => els.map(e => e.dataset.label)') == ['Main', 'Desserts', 'Beverages', 'Appetizer']
        page.locator('[data-config] button[type="submit"]').last.click()
        assert page.locator('#date').get_attribute('aria-invalid') == 'true'
        page.locator('#date').fill((date.today() + timedelta(days=7)).isoformat())
        page.locator('#time').fill('12:00')
        page.locator('[data-config] button[type="submit"]').last.click()
        outgoing = page.evaluate('window.__outgoing')
        assert outgoing and outgoing.startswith('https://wa.me/6596865290?text='), outgoing
    journeys.append('buffet quotation')

    # Order Online: search, dish dialog, note, quantity, add, cart persistence, increase, remove.
    goto(page, 'order/')
    page.evaluate('localStorage.removeItem("mc-cart-v1")'); page.reload(wait_until='networkidle')
    page.locator('input[data-search]').fill('ayam bakar')
    assert page.locator('[data-item]:visible').count() == 1
    page.locator('[data-item]:visible [data-open]').click()
    assert page.locator('[data-dish]').is_visible()
    page.locator('#dish-note').fill('Less spicy')
    page.locator('[data-dish-step="1"]').click()
    assert page.locator('[data-dish-qty]').inner_text() == '2'
    page.locator('[data-dish] button[value="add"]').click()
    assert page.locator('[data-dish]').is_hidden()
    goto(page, 'cart/')
    assert page.locator('[data-groups] input').input_value() == 'Less spicy'
    page.reload(wait_until='networkidle')
    page.get_by_role('button', name='Increase Ayam bakar (grilled chicken)', exact=True).click()
    assert page.evaluate('JSON.parse(localStorage.getItem("mc-cart-v1"))')[0]['qty'] == 3
    page.get_by_role('button', name='Remove Ayam bakar (grilled chicken)', exact=True).click()
    assert page.locator('[data-empty]').is_visible()
    journeys.append('order online and cart')

    # Mini buffet: rice choice, date and time carry into add-ons.
    goto(page, 'package/nasi-classic-set/')
    page.locator('[data-group="0"] input').first.check()
    page.locator('#date').fill((date.today() + timedelta(days=7)).isoformat())
    page.locator('#time').fill('12:00')
    page.locator('[data-config] button[type="submit"]').last.click(); page.wait_for_url('**/add-ons/')
    assert page.locator('[data-has-draft]').is_visible()
    journeys.append('mini buffet to add-ons')

    for width in [320, 768, 1024]:
        page.set_viewport_size({'width': width, 'height': 900})
        for path in ['', 'order/', 'package/indian-cuisine/', 'catering/buffet/']:
            goto(page, path); assert no_overflow(page), (width, path)
    assert not errors, errors
    context.close()

    # Theme still works in-page when storage is denied.
    restricted = browser.new_context(viewport={'width': 390, 'height': 844})
    restricted.add_init_script('Object.defineProperty(window, "localStorage", { get() { throw new DOMException("Denied", "SecurityError") } })')
    q = restricted.new_page(); goto(q)
    assert theme(q) == 'light'; toggle(q); assert theme(q) == 'dark'
    journeys.append('theme without storage')
    restricted.close(); browser.close()

print(json.dumps({'status': 'passed', 'url': URL, 'journeys': journeys, 'screenshots': str(OUT)}, indent=2))
