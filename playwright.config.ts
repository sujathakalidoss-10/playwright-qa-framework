import { defineConfig, devices } from '@playwright/test';
import { env, adminStorageState } from './config/env';

const orangeHrmBrowser = {
  ...devices['Desktop Chrome'],
  baseURL: env.orangeHrm.baseUrl,
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
};

const isCI = !!process.env.CI;

export default defineConfig({
  // Public demo sites are shared and sometimes slow - generous but bounded timeouts.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  // Retries only in CI: locally we want flakiness to be visible, not hidden.
  retries: isCI ? 2 : 0,
  workers: isCI ? 2 : undefined,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html', open: 'never' }],
    ['junit', { outputFile: 'reports/junit/results.xml' }],
  ],
  outputDir: 'test-results',

  use: {
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  // Two projects = clear separation of API and UI layers, each runnable on its own.
  projects: [
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: env.petstore.baseUrl,
        extraHTTPHeaders: {
          Accept: 'application/json',
        },
      },
    },
    // Logs in once and saves the session; runs automatically before 'ui'.
    {
      name: 'ui-setup',
      testDir: './tests/ui',
      testMatch: /.*\.setup\.ts/,
      use: orangeHrmBrowser,
    },
    // Every UI test starts logged in as admin; login tests opt out with an empty storageState.
    {
      name: 'ui',
      testDir: './tests/ui',
      dependencies: ['ui-setup'],
      use: { ...orangeHrmBrowser, storageState: adminStorageState },
    },
  ],
});
