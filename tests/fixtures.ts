import { test as base, expect } from '@playwright/test';

declare global {
  interface Window {
    __whatsapp?: string;
  }
}

export { expect };

export const test = base.extend<{ failOnPageErrors: void; whatsapp: () => Promise<string> }>({
  // Any uncaught error in the page fails the test.
  failOnPageErrors: [
    async ({ page }, use) => {
      const errors: Array<string> = [];
      page.on('pageerror', (e) => errors.push(e.message));
      await use();
      expect(errors).toEqual([]);
    },
    { auto: true },
  ],
  // Nothing ever reaches WhatsApp: window.open is replaced, and this returns the text
  // of the last message the page tried to open.
  whatsapp: [
    async ({ page }, use) => {
      await page.addInitScript(() => {
        window.open = (url) => {
          window.__whatsapp = String(url);
          return null;
        };
      });
      await use(async () => {
        const url = await page.evaluate(() => window.__whatsapp);
        expect(url, 'the page should open WhatsApp').toMatch(
          /^https:\/\/wa\.me\/6596865290\?text=/,
        );
        return new URL(url ?? '').searchParams.get('text') ?? '';
      });
    },
    { auto: true },
  ],
});

const pad = (v: number) => String(v).padStart(2, '0');

/** A date input value n days from today, in local time. */
export function daysFromToday(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
