import { defineConfig, devices } from '@playwright/test';

/**
 * Config de Playwright para tests E2E.
 *
 * IMPORTANTE: `testDir: './e2e'` evita que Playwright cargue los `*.spec.ts` de Jasmine
 * (los unit tests de Angular se ejecutan con `npm test` / `ng test`, no con Playwright).
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /.*\.e2e\.spec\.ts$/,

  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: 'html',

  use: {
    baseURL: process.env.E2E_BASE_URL || 'http://localhost:4200',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Si querés que Playwright levante `ng serve` automáticamente, descomentá esto:
  // webServer: {
  //   command: 'npm start',
  //   url: 'http://localhost:4200',
  //   reuseExistingServer: !process.env.CI,
  //   timeout: 180_000,
  // },
});
