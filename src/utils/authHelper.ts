import { Page, expect } from '@playwright/test';
import { env } from '../../config/env';
import { LoginPage } from '../ui/pages/loginPage';
import { DashboardPage } from '../ui/pages/dashboardPage';

/**
 * Common login helper for UI tests.
 *
 * Wraps the full "open login page -> submit credentials -> land on dashboard" flow so specs and
 * setup files log in with one call instead of repeating the steps. The Page Objects still own the
 * locators; this helper only composes them into a reusable journey.
 */

export interface Credentials {
  username: string;
  password: string;
}

/** Admin credentials from config/env.ts (overridable via .env / CI variables). */
export const adminCredentials: Credentials = {
  username: env.orangeHrm.username,
  password: env.orangeHrm.password,
};

/**
 * Logs in through the real login form and waits until the dashboard is shown.
 * Fails with a clear assertion if the login does not succeed.
 */
export async function login(page: Page, credentials: Credentials = adminCredentials): Promise<void> {
  const loginPage = new LoginPage(page);
  const dashboardPage = new DashboardPage(page);

  await loginPage.open();
  await loginPage.login(credentials.username, credentials.password);

  await expect(page).toHaveURL(dashboardPage.path);
  await expect(dashboardPage.heading).toBeVisible();
}

/** Shortcut for the most common case: log in as the admin user. */
export async function loginAsAdmin(page: Page): Promise<void> {
  await login(page, adminCredentials);
}
