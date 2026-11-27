import { existsSync } from 'node:fs';
import { defineConfig, devices } from '@playwright/test';

const port = 4322;
// Set URL to test a deployed site instead of a local build, e.g. URL=https://makanchapter.elham.dev/
const remote = process.env.URL;
// Use the system Chromium when there is one, so no browser download is needed.
const chromium =
  process.env.CHROMIUM ?? (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined);

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: remote ?? `http://127.0.0.1:${port}/`,
    contextOptions: { reducedMotion: 'reduce' },
    launchOptions: { executablePath: chromium },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } },
    },
    {
      // The ordering flows again on a phone, where most customers order.
      name: 'phone',
      testMatch: ['buffet.spec.ts', 'catering-order.spec.ts', 'order-online.spec.ts'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: remote
    ? undefined
    : {
        command: `npm run build && astro preview --host 127.0.0.1 --port ${port} --ignore-lock`,
        url: `http://127.0.0.1:${port}/`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
