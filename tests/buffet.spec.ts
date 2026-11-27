import { daysFromToday, expect, test } from './fixtures';

test.describe('buffet listing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('catering/buffet/');
  });

  test('search narrows the list, and reset brings everything back', async ({ page }) => {
    const cards = page.locator('[data-package]');
    const visible = page.locator('[data-package]:visible');
    const total = await cards.count();
    await page.locator('input[data-search]').fill('kampong');
    await expect(visible.locator('h3')).toHaveText(['Kampong Cuisine']);
    await page.locator('input[data-search]').fill('zzzzz');
    await expect(visible).toHaveCount(0);
    await expect(page.locator('[data-empty]')).toBeVisible();
    await page.locator('[data-filter-reset]:visible').first().click();
    await expect(visible).toHaveCount(total);
  });

  test('the menu filter shows only that kind of package', async ({ page }) => {
    const opener = page.locator('[data-filter-open]');
    if (await opener.isVisible()) {
      await opener.click();
    }
    await page.locator('[data-filter="menus"][value="buffet"]').check();
    const showResults = page.getByRole('button', { name: 'Show results' });
    if (await showResults.isVisible()) {
      await showResults.click();
    }
    const visible = page.locator('[data-package]:visible');
    await expect(visible.first()).toBeVisible();
    for (const category of await visible.evaluateAll((els) =>
      els.map((e) => e.getAttribute('data-category')),
    )) {
      expect(category).toBe('buffet');
    }
  });
});

test('a buffet quotation needs a date, then opens WhatsApp with the request', async ({
  page,
  whatsapp,
}) => {
  await page.goto('package/indian-cuisine/');
  const submit = page.locator('[data-config] button[type="submit"]:visible');
  await submit.click();
  await expect(page.locator('#date')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('#date').fill(daysFromToday(7));
  await page.locator('#time').fill('12:00');
  await submit.click();
  const message = await whatsapp();
  expect(message).toContain('I would like a quotation');
  expect(message).toContain('Package: Indian Cuisine');
  expect(message).toContain('Guests:');
});

test('a mini buffet set goes through add-ons into the cart', async ({ page }) => {
  await page.goto('package/nasi-classic-set/');
  await page.locator('[data-group="0"] input').first().check();
  await page.locator('#date').fill(daysFromToday(7));
  await page.locator('#time').fill('12:00');
  await page.locator('[data-config] button[type="submit"]:visible').click();

  await page.waitForURL('**/add-ons/');
  await expect(page.locator('[data-has-draft]')).toBeVisible();
  await expect(page.locator('h1 [data-pkg-name]')).toHaveText('Nasi Classic Set');
  const addToCart = page.locator('[data-addons] button[type="submit"]');
  await addToCart.click();
  await expect(page.locator('[data-agree]')).toHaveAttribute('aria-invalid', 'true');
  await page.locator('[data-agree]').check();
  await addToCart.click();

  await page.waitForURL('**/cart/');
  await expect(page.locator('[data-groups]')).toContainText('Nasi Classic Set');
  await expect(page.locator('[data-groups]')).toContainText('Mini buffet');
});
