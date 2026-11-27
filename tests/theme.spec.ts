import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

const rootStyle = (page: Page, property: 'backgroundColor' | 'colorScheme') =>
  page.evaluate((p) => getComputedStyle(document.documentElement)[p], property);

test('follows the system light or dark setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  expect(await rootStyle(page, 'colorScheme')).toBe('light dark');
  await expect(page.locator('meta[name="color-scheme"]')).toHaveAttribute('content', 'light dark');
  const light = await rootStyle(page, 'backgroundColor');
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(async () => rootStyle(page, 'backgroundColor')).not.toBe(light);
});

test('shows the badge variant for the system setting', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('');
  const badge = page.locator('[data-moe-badge] img');
  await badge.scrollIntoViewIfNeeded();
  const src = async () => badge.evaluate((i: HTMLImageElement) => i.currentSrc);
  await expect.poll(src).toMatch(/moe-badge-v2\./);
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect.poll(src).toMatch(/moe-badge-v2-dark\./);
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
  ['ink', 'cream'],
  ['muted', 'cream'],
  ['price', 'bg'],
  ['price', 'cream'],
  ['band-ink', 'band'],
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
    const tokens = await page.evaluate(
      ([names, m]) => {
        const style = getComputedStyle(document.documentElement);
        return Object.fromEntries(
          names.map((n) => [n, style.getPropertyValue(`--mc-${n}-${m}`).trim()]),
        );
      },
      [[...new Set(pairs.flat())], mode] as const,
    );
    for (const [fg, bg] of pairs) {
      const [dark, light] = [luminance(tokens[fg]), luminance(tokens[bg])].sort((a, b) => a - b);
      const ratio = (light + 0.05) / (dark + 0.05);
      expect(ratio, `${fg} on ${bg}: ${tokens[fg]} on ${tokens[bg]}`).toBeGreaterThanOrEqual(4.5);
    }
  });
}
