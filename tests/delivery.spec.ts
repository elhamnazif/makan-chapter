import { expect, test } from './fixtures';

test('an empty cart has nothing to deliver', async ({ page }) => {
  await page.goto('delivery/');
  await expect(page.locator('[data-empty]')).toBeVisible();
  await expect(page.locator('[data-delivery]')).toBeHidden();
});

test.describe('with items in the cart', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('');
    await page.evaluate(() => {
      const item = { id: 'test-dish', name: 'Test dish', unitCents: 1000 };
      localStorage.setItem(
        'mc-cart-v2',
        JSON.stringify([{ ...item, key: 'test-dish', qty: 2, note: 'No onions' }]),
      );
    });
    await page.goto('delivery/');
  });

  test('every required field is checked before sending', async ({ page }) => {
    await page.getByRole('button', { name: 'Send Order on WhatsApp' }).click();
    for (const id of ['name', 'email', 'phone', 'address']) {
      await expect(page.locator(`#${id}`)).toHaveAttribute('aria-invalid', 'true');
    }
    await expect(page.locator('#name')).toBeFocused();
    // A flagged field is checked again when the customer leaves it, not on each keystroke.
    await page.locator('#email').fill('not-an-email');
    await expect(page.locator('#email-error')).toHaveText('Enter your email address.');
    await page.locator('#email').blur();
    await expect(page.locator('#email-error')).toHaveText('Enter a valid email address.');
    // Fixing a field clears its message straight away.
    await page.locator('#email').fill('siti@example.com');
    await expect(page.locator('#email-error')).toBeHidden();
    await expect(page.locator('#email')).not.toHaveAttribute('aria-invalid');
  });

  test('the order, fees and details go to WhatsApp', async ({ page, whatsapp }) => {
    // Meals: 2 x S$10, plus the S$15 meal delivery fee.
    await expect(page.locator('[data-total]')).toHaveText('S$35');
    await page.locator('#name').fill('Siti Aminah');
    await page.locator('#email').fill('siti@example.com');
    await page.locator('#phone').fill('9123 4567');
    await page.locator('#address').fill('1 Raffles Place, #10-01');
    await page.locator('#notes').fill('Call on arrival');
    await page.getByRole('button', { name: 'Send Order on WhatsApp' }).click();

    const message = await whatsapp();
    for (const line of [
      '2 x Test dish (S$20)',
      'Note: No onions',
      'Meal delivery: S$15',
      'Total: S$35',
      'Name: Siti Aminah',
      'Email: siti@example.com',
      'Phone: 9123 4567',
      'Address: 1 Raffles Place, #10-01',
      'Instructions: Call on arrival',
    ]) {
      expect(message).toContain(line);
    }
    expect(message).not.toContain('promotions');
    await expect(page.locator('[data-sent]')).toBeVisible();
    await expect(page.locator('[data-reopen]')).toHaveAttribute('href', /^https:\/\/wa\.me\//);
  });
});
