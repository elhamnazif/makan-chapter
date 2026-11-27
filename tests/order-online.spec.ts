import type { Page } from '@playwright/test';
import { expect, test } from './fixtures';

type StoredItem = { qty: number; note?: string };

const cart = async (page: Page): Promise<Array<StoredItem>> =>
  page.evaluate(() => {
    const items: Array<StoredItem> = JSON.parse(localStorage.getItem('mc-cart-v2') ?? '[]');
    return items;
  });

test('a dish with a note and quantity goes into the cart, and the cart edits it', async ({
  page,
}) => {
  await page.goto('order/');
  await page.locator('input[data-search]').fill('ayam bakar');
  await expect(page.locator('[data-item]:visible')).toHaveCount(1);
  await page.locator('[data-item]:visible [data-open]').click();

  const dialog = page.locator('[data-dish]');
  await expect(dialog).toBeVisible();
  await page.locator('#dish-note').fill('Less spicy');
  await page.locator('[data-dish-step="1"]').click();
  await expect(page.locator('[data-dish-qty]')).toHaveText('2');
  await dialog.locator('button[value="add"]').click();
  await expect(dialog).toBeHidden();
  // The dish is saved when the dialog's close event fires, just after it hides.
  await expect.poll(async () => cart(page)).toMatchObject([{ qty: 2, note: 'Less spicy' }]);

  await page.goto('cart/');
  await expect(page.locator('[data-items] input')).toHaveValue('Less spicy');
  await page
    .getByRole('button', { name: 'Increase Ayam bakar (grilled chicken)', exact: true })
    .click();
  await expect.poll(async () => cart(page)).toMatchObject([{ qty: 3 }]);
  await page
    .getByRole('button', { name: 'Remove Ayam bakar (grilled chicken)', exact: true })
    .click();
  await expect(page.locator('[data-empty]')).toBeVisible();
  expect(await cart(page)).toEqual([]);
});

test('the dish dialog closes on a click outside it', async ({ page, isMobile }) => {
  test.skip(isMobile, 'On phones the dialog fills the screen.');
  await page.goto('order/');
  await page.locator('[data-open]').first().click();
  const dialog = page.locator('[data-dish]');
  await expect(dialog).toBeVisible();
  await page.mouse.click(8, 8);
  await expect(dialog).toBeHidden();
  expect(await cart(page)).toEqual([]);
});
