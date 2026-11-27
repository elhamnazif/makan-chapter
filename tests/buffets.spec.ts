import { expect, test } from './fixtures';

test('a wedding and event buffet leads to its menu and a WhatsApp quotation', async ({ page }) => {
  await page.goto('catering/');
  await page.locator('[data-buffet-card="indian-cuisine"] a').click();
  await expect(page).toHaveURL(/\/catering\/buffets\/indian-cuisine\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Indian Cuisine');
  await expect(page.locator('[data-full-menu]')).toContainText('Nasi Briyani Dam');
  const href = (await page.locator('a[data-quote]').getAttribute('href')) ?? '';
  expect(href).toMatch(/^https:\/\/wa\.me\/6596865290\?text=/);
  expect(new URL(href).searchParams.get('text')).toContain('Indian Cuisine');
});
