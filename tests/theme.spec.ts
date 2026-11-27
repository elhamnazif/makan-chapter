import { expect, test, theme } from './fixtures';

const toggle = '[data-theme-toggle]';

test('is light by default, even when the OS prefers dark', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('');
  await expect(theme(page)).toHaveAttribute('data-theme', 'light');
  await expect(page.locator(toggle)).toHaveAttribute('aria-pressed', 'false');
});

test('remembers the choice across reloads and pages', async ({ page }) => {
  await page.goto('');
  await page.locator(toggle).click();
  await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator(toggle)).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
  await page.goto('package/indian-cuisine/');
  await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
  await page.locator(toggle).click();
  await page.reload();
  await expect(theme(page)).toHaveAttribute('data-theme', 'light');
});

test('follows a change made in another tab', async ({ context, page }) => {
  await page.goto('');
  const other = await context.newPage();
  await other.goto('order/');
  await page.locator(toggle).click();
  await expect(theme(other)).toHaveAttribute('data-theme', 'dark');
});

test('still switches when storage is blocked', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Denied', 'SecurityError');
      },
    });
  });
  await page.goto('');
  await expect(theme(page)).toHaveAttribute('data-theme', 'light');
  await page.locator(toggle).click();
  await expect(theme(page)).toHaveAttribute('data-theme', 'dark');
});

test('shows the badge variant for the current theme', async ({ page }) => {
  await page.goto('');
  const badge = page.locator('[data-moe-badge] img:visible');
  await expect(badge).toHaveCount(1);
  await expect(badge).not.toHaveAttribute('src', /dark/);
  await page.locator(toggle).click();
  await expect(badge).toHaveAttribute('src', /dark/);
});

// WCAG AA for body text: every text colour against the backgrounds it sits on.
const pairs = [
  ['ink', 'bg'],
  ['muted', 'bg'],
  ['muted', 'surface'],
  ['muted', 'surface-2'],
  ['accent-ink', 'accent'],
  ['price', 'surface'],
  ['muted', 'note-bg'],
  ['footer-ink', 'footer-bg'],
  ['footer-muted', 'footer-bg'],
] as const;

function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? h.replaceAll(/./g, '$&$&') : h.slice(0, 6);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const v = Number.parseInt(full.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

for (const mode of ['light', 'dark'] as const) {
  test(`text colours meet 4.5:1 contrast in ${mode} mode`, async ({ page }) => {
    await page.goto('');
    if (mode === 'dark') {
      await page.locator(toggle).click();
    }
    const tokens = await page.evaluate(
      (names) => {
        const style = getComputedStyle(document.documentElement);
        return Object.fromEntries(
          names.map((n) => [n, style.getPropertyValue(`--mc-${n}`).trim()]),
        );
      },
      [...new Set(pairs.flat())],
    );
    for (const [fg, bg] of pairs) {
      const [dark, light] = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => a - b);
      const ratio = (light + 0.05) / (dark + 0.05);
      expect(ratio, `${fg} on ${bg}: ${tokens[fg]} on ${tokens[bg]}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
