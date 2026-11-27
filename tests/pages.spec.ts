import { expect, test } from './fixtures';

// Crawl every page linked from the home page, at each width: no broken links, no sideways
// scrolling, and every image the visitor can see has loaded.
for (const width of [320, 390, 768, 1440]) {
  test(`every page works at ${width}px`, async ({ page, baseURL }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    const origin = new URL(baseURL ?? '').origin;
    const queue = [new URL('', baseURL).pathname];
    const seen = new Set(queue);
    while (queue.length) {
      const path = queue.shift() ?? '';
      const response = await page.goto(path);
      expect(response?.status(), path).toBe(200);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1),
        `${path} scrolls sideways`,
      ).toBe(true);
      const broken = await page.evaluate(async () => {
        const visible = [...document.images].filter(
          (i) => i.loading !== 'lazy' && i.checkVisibility(),
        );
        await Promise.all(visible.map(async (i) => i.decode().catch(() => undefined)));
        return visible.flatMap((i) => (i.naturalWidth === 0 ? [i.src] : []));
      });
      expect(broken, `${path} has broken images`).toEqual([]);
      const links = await page
        .locator('a[href]')
        .evaluateAll((as) => as.map((a) => a.getAttribute('href') ?? ''));
      for (const href of links) {
        const url = new URL(href, page.url());
        if (url.origin === origin && !seen.has(url.pathname)) {
          seen.add(url.pathname);
          queue.push(url.pathname);
        }
      }
    }
    expect(seen.size).toBeGreaterThan(20);
  });
}

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the menu opens and closes with Escape', async ({ page }) => {
    await page.goto('');
    await page.locator('[data-drawer-open]').click();
    await expect(page.locator('[data-drawer]')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('[data-drawer]')).toBeHidden();
  });
});
