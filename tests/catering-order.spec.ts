import type { Page } from '@playwright/test';
import { daysFromToday, expect, test } from './fixtures';

const next = (page: Page) => page.locator('[data-next]');
const total = (page: Page) => page.locator('[data-total]');
const pickDish = async (page: Page, nth: number) => {
  for (const category of await page.locator('[data-category]:visible').all()) {
    await category.locator('label').nth(nth).click();
  }
};

test('a menu card leads to the full menu, and the menu to its order form', async ({ page }) => {
  await page.goto('catering/');
  await page.locator('[data-menu-card="nasi-lemak"] [data-view-menu]').click();
  await expect(page).toHaveURL(/\/catering\/menu\/nasi-lemak\/$/);
  await page.locator('a[data-order]').click();
  await expect(page).toHaveURL(/\/catering\/order\/nasi-lemak\/$/);
});

test('Mini Catering: 20 to 50 pax, 3 days ahead, through to payment', async ({ page }) => {
  await page.goto('catering/order/nasi-lemak/');

  await next(page).click();
  await expect(page.locator('#package-error')).toBeVisible();
  await page.locator('[data-package-card="mini"]').click();
  await next(page).click();

  // Step 2: dishes and pax.
  await expect(page.locator('[data-category="Drinks"]')).toBeHidden();
  await expect(page.locator('[data-bulk]')).toBeHidden();
  await next(page).click();
  await expect(page.locator('[data-cat-error]:visible')).toHaveCount(5);
  await pickDish(page, 0);
  await expect(page.locator('#pax')).toHaveValue('20');
  for (let i = 0; i < 35; i++) {
    await page.locator('[data-pax-step="1"]').click();
  }
  await expect(page.locator('#pax')).toHaveValue('50');
  await page.locator('#pax').fill('60');
  await next(page).click();
  await expect(page.locator('#pax-error')).toContainText('up to 50 pax');
  await page.locator('#pax').fill('25');
  // 25 pax x S$14.90, plus S$30 delivery.
  await expect(total(page)).toHaveText('S$402.50');
  await next(page).click();

  // Step 3: event date and one delivery time.
  await expect(page.locator('#delivery-time')).toBeVisible();
  await expect(page.locator('#ready-time')).toBeHidden();
  await page.locator('#date').fill(daysFromToday(2));
  await page.locator('#delivery-time').fill('12:30');
  await next(page).click();
  await expect(page.locator('#date-error')).toContainText('at least 3 days');
  await page.locator('#date').fill(daysFromToday(3));
  await next(page).click();

  // Step 4: contact details. A CBD postal code adds S$5.
  await next(page).click();
  await expect(page.locator('.field-error:visible')).toHaveCount(5);
  await page.locator('#name').fill('Siti Aminah');
  await page.locator('#phone').fill('9123 4567');
  await page.locator('#email').fill('siti@example.com');
  await page.locator('#address').fill('1 Raffles Place, #10-01');
  await page.locator('#postal').fill('048616');
  await expect(total(page)).toHaveText('S$407.50');
  await next(page).click();

  // Step 5: review, terms, simulated payment.
  await expect(next(page)).toContainText('Pay now');
  await next(page).click();
  await expect(page.locator('#terms-error')).toBeVisible();
  await page.locator('#terms').check();
  await next(page).click();
  await expect(page.locator('[data-confirmation]')).toBeVisible();
  await expect(page.locator('[data-confirmation]')).toContainText('S$407.50');
});

test('Classic Catering: 50 to 100 pax online, drinks, teardown after ready time', async ({
  page,
}) => {
  await page.goto('catering/order/western-delights/');
  await page.locator('[data-package-card="classic"]').click();
  await next(page).click();

  await expect(page.locator('[data-category="Drinks"]')).toBeVisible();
  await expect(page.locator('#pax')).toHaveValue('50');
  await page.locator('#pax').fill('49');
  await next(page).click();
  await expect(page.locator('#pax-error')).toContainText('from 50 pax');
  await page.locator('#pax').fill('150');
  await next(page).click();
  await expect(page.locator('#pax-error')).toContainText('up to 100 pax');
  await expect(page.locator('[data-bulk] a')).toHaveAttribute('href', /wa\.me/);
  await page.locator('#pax').fill('98');
  for (let i = 0; i < 5; i++) {
    await page.locator('[data-pax-step="1"]').click();
  }
  await expect(page.locator('#pax')).toHaveValue('100');
  await page.locator('#pax').fill('50');

  // Seafood is one pick across the fish and prawn options.
  await expect(page.locator('[data-category="Seafood"] input')).toHaveCount(6);
  await expect(page.locator('[data-category="Seafood"]').getByText('Prawn options')).toBeVisible();
  await pickDish(page, 1);
  await next(page).click();

  await page.locator('#date').fill(daysFromToday(10));
  await page.locator('#ready-time').fill('13:00');
  await page.locator('#teardown-time').fill('12:00');
  await next(page).click();
  await expect(page.locator('#teardown-time-error')).toBeVisible();
  // 50 pax x S$25, S$80 setup and delivery, S$20 for teardown after 9pm.
  await page.locator('#teardown-time').fill('21:30');
  await expect(total(page)).toHaveText('S$1,350');
});
