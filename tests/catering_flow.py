"""Browser run through the event catering order flow (client brief v4). Never sends anything: payment is simulated.

Serve a build first, e.g.  npm run build && npx astro preview --port 18763
then:                      python tests/catering_flow.py   (URL=... to test another host)
"""
import os
from datetime import date, timedelta
from pathlib import Path
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parents[1]
URL = os.environ.get('URL', 'http://127.0.0.1:18763/').rstrip('/') + '/'
OUT = ROOT / 'test-results' / 'catering'
OUT.mkdir(parents=True, exist_ok=True)
CHROMIUM = os.environ.get('CHROMIUM', '/usr/bin/chromium')
passed = []


def ok(cond, msg):
    assert cond, msg
    passed.append(msg)


with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=CHROMIUM, headless=True, args=['--no-sandbox'])
    for viewport, tag in [({'width': 1440, 'height': 1000}, 'desktop'), ({'width': 390, 'height': 844}, 'phone')]:
        ctx = browser.new_context(viewport=viewport, reduced_motion='reduce')
        pg = ctx.new_page()
        errors = []
        pg.on('pageerror', lambda e: errors.append(str(e)))
        no_overflow = lambda: pg.evaluate('document.documentElement.scrollWidth <= innerWidth + 1')
        total = lambda: pg.locator('[data-total]').inner_text()
        nxt = pg.locator('[data-next]')

        pg.goto(URL + 'catering/', wait_until='networkidle')
        ok(pg.locator('[data-menu-card]').count() == 5, f'{tag}: five menu cards')
        ok([t.strip() for t in pg.locator('[data-menu-card] h3').all_inner_texts()] == ['Nasi Ambeng', 'Nasi Lemak', 'Nasi Minyak', 'Western Delights', 'Singapore Favourites'], f'{tag}: menu order')
        ok(pg.locator('[data-dropdown-toggle]').count() == 0, f'{tag}: no catering dropdown')
        ok(no_overflow(), f'{tag}: catering page fits')
        pg.screenshot(path=str(OUT / f'{tag}-catering.png'), full_page=True)

        # View Menu, then Order from the full menu page.
        pg.locator('[data-menu-card="nasi-lemak"] [data-view-menu]').click(); pg.wait_for_load_state('networkidle')
        ok('/catering/menu/nasi-lemak/' in pg.url and no_overflow(), f'{tag}: view menu')
        pg.locator('a[data-order]').click(); pg.wait_for_load_state('networkidle')
        ok('/catering/order/nasi-lemak/' in pg.url, f'{tag}: order from menu page')

        # Mini path.
        nxt.click(); ok(pg.locator('#package-error').is_visible(), f'{tag}: package required')
        pg.locator('[data-package-card="mini"]').click(); nxt.click()
        ok(not pg.locator('[data-category="Drinks"]').is_visible(), f'{tag}: no drinks for mini')
        ok(not pg.locator('[data-bulk]').is_visible(), f'{tag}: no bulk link for mini')
        nxt.click(); ok(pg.locator('[data-cat-error]:visible').count() == 5, f'{tag}: one dish per category required')
        for f in pg.locator('[data-category]:visible').all(): f.locator('label').first.click()
        ok(pg.input_value('#pax') == '20', f'{tag}: mini starts at 20')
        for _ in range(35): pg.locator('[data-pax-step="1"]').click()
        ok(pg.input_value('#pax') == '50', f'{tag}: mini stepper capped at 50')
        pg.fill('#pax', '60'); nxt.click(); ok('up to 50 pax' in pg.inner_text('#pax-error'), f'{tag}: over 50 blocked for mini')
        pg.fill('#pax', '25'); ok(total() == 'S$402.50', f'{tag}: 25 x 14.90 + 30')
        ok(no_overflow(), f'{tag}: step 2 fits')
        nxt.click()
        ok(pg.locator('#delivery-time').is_visible() and not pg.locator('#ready-time').is_visible(), f'{tag}: mini asks one delivery time')
        pg.fill('#date', (date.today() + timedelta(days=2)).isoformat()); pg.fill('#delivery-time', '12:30'); nxt.click()
        ok('at least 3 days' in pg.inner_text('#date-error'), f'{tag}: under 3 days blocked')
        pg.fill('#date', (date.today() + timedelta(days=3)).isoformat()); nxt.click()
        nxt.click(); ok(pg.locator('.field-error:visible').count() == 5, f'{tag}: contact fields required')
        pg.fill('#name', 'Siti Aminah'); pg.fill('#phone', '9123 4567'); pg.fill('#email', 'siti@example.com')
        pg.fill('#address', '1 Raffles Place, #10-01'); pg.fill('#postal', '048616')
        ok(total() == 'S$407.50', f'{tag}: CBD +5')
        nxt.click(); ok('Pay now' in nxt.inner_text(), f'{tag}: review step')
        nxt.click(); ok(pg.locator('#terms-error').is_visible(), f'{tag}: T&Cs required')
        pg.check('#terms'); nxt.click()
        pg.wait_for_selector('[data-confirmation]:not([hidden])', timeout=5000)
        ok('S$407.50' in pg.inner_text('[data-confirmation]'), f'{tag}: confirmation')
        pg.screenshot(path=str(OUT / f'{tag}-confirmation.png'), full_page=True)

        # Classic path.
        pg.goto(URL + 'catering/order/western-delights/', wait_until='networkidle')
        pg.locator('[data-package-card="classic"]').click(); nxt.click()
        ok(pg.locator('[data-category="Drinks"]').is_visible(), f'{tag}: drinks for classic')
        ok(pg.input_value('#pax') == '50', f'{tag}: classic starts at 50')
        pg.fill('#pax', '49'); nxt.click(); ok('from 50 pax' in pg.inner_text('#pax-error'), f'{tag}: under 50 blocked for classic')
        pg.fill('#pax', '150'); nxt.click(); ok('up to 100 pax' in pg.inner_text('#pax-error'), f'{tag}: over 100 blocked for classic')
        link = pg.locator('[data-bulk] a')
        ok(link.is_visible() and 'wa.me' in link.get_attribute('href'), f'{tag}: bulk terms WhatsApp link')
        pg.fill('#pax', '98')
        for _ in range(5): pg.locator('[data-pax-step="1"]').click()
        ok(pg.input_value('#pax') == '100', f'{tag}: classic stepper capped at 100')
        pg.fill('#pax', '50')
        for f in pg.locator('[data-category]:visible').all(): f.locator('label').nth(1).click()
        ok(pg.locator('[data-category="Seafood"] input').count() == 6 and pg.locator('[data-category="Seafood"]').get_by_text('Prawn options').is_visible(), f'{tag}: seafood is one pick across fish and prawn')
        pg.screenshot(path=str(OUT / f'{tag}-classic-step2.png'), full_page=True)
        nxt.click()
        pg.fill('#date', (date.today() + timedelta(days=10)).isoformat()); pg.fill('#ready-time', '13:00'); pg.fill('#teardown-time', '12:00'); nxt.click()
        ok(pg.locator('#teardown-time-error').is_visible(), f'{tag}: teardown before ready blocked')
        pg.fill('#teardown-time', '21:30'); ok(total() == 'S$1,350', f'{tag}: 50 x 25 + 80 + 20')
        ok(not errors, f'{tag}: no page errors {errors}')
        ctx.close()
    browser.close()

print(f'{len(passed)} checks passed')
