import { expect, test } from './fixtures';

test('an enquiry needs a name and number, and sends only what was filled in', async ({
  page,
  whatsapp,
}) => {
  await page.goto('contact/');
  const send = page.getByRole('button', { name: 'Send Enquiry' });
  await send.click();
  await expect(page.locator('#c-name')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.locator('#c-phone')).toHaveAttribute('aria-invalid', 'true');

  await page.locator('#c-name').fill('Siti Aminah');
  await page.locator('#c-phone').fill('9123 4567');
  await page.locator('#c-event').selectOption('Wedding');
  await page.getByLabel('Mini buffet').check();
  await page.locator('#c-pax').fill('80');
  await send.click();

  const message = await whatsapp();
  expect(message.split('\n')).toEqual([
    'Hi Makan Chapter, I would like to enquire about catering.',
    'Name: Siti Aminah',
    'Contact: 9123 4567',
    'Event: Wedding',
    'Services: Mini buffet',
    'Guests: 80',
  ]);
});
