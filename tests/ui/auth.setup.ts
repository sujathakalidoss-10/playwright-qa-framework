import { test as setup, expect } from '../../src/fixtures';
import { env, adminStorageState } from '../../config/env';

/**
 * Runs once before the UI project: logs in through the real form and saves the session
 * (cookies) to a file. Every UI test then starts already logged in, so only the login tests
 * pay for the login form, and a login problem fails here once with a clear message
 * instead of failing every test.
 */

setup('log in as admin and save the session', async ({ page, loginPage, dashboardPage }) => {
  await loginPage.open();
  await loginPage.login(env.orangeHrm.username, env.orangeHrm.password);
  await expect(page).toHaveURL(dashboardPage.path);

  await page.context().storageState({ path: adminStorageState });
});
