import { test as setup } from '../../src/fixtures';
import { adminStorageState } from '../../config/env';
import { loginAsAdmin } from '../../src/utils/authHelper';

/**
 * Runs once before the UI project: logs in through the real form and saves the session
 * (cookies) to a file. Every UI test then starts already logged in, so only the login tests
 * pay for the login form, and a login problem fails here once with a clear message
 * instead of failing every test.
 */

setup('log in as admin and save the session', async ({ page }) => {
  await loginAsAdmin(page);

  await page.context().storageState({ path: adminStorageState });
});
