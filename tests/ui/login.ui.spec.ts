import { test, expect } from '../../src/fixtures';
import { env } from '../../config/env';
import { invalidLoginCases } from '../../src/data/loginData';

/**
 * Feature under test: OrangeHRM authentication.
 *
 * Why login: it is the gate to every other journey. If it breaks, 100% of users are blocked,
 * so it is the highest-value UI check and the natural smoke test.
 */
test.describe('OrangeHRM UI - Login', () => {
  // These tests are about logging in, so they must start with no session
  // (the 'ui' project otherwise starts every test logged in as admin).
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
    await expect(loginPage.loginButton).toBeVisible();
  });

  test('admin can log in and log out @smoke', async ({ page, loginPage, dashboardPage }) => {
    await test.step('log in with valid credentials', async () => {
      await loginPage.login(env.orangeHrm.username, env.orangeHrm.password);
    });

    await test.step('lands on the dashboard', async () => {
      await expect(page).toHaveURL(dashboardPage.path);
      await expect(dashboardPage.heading).toBeVisible();
    });

    await test.step('log out returns to the login page', async () => {
      await dashboardPage.logout();
      await expect(page).toHaveURL(loginPage.path);
      await expect(loginPage.loginButton).toBeVisible();
    });
  });

  // Data-driven negatives: one test per row in src/data/loginData.ts
  for (const scenario of invalidLoginCases) {
    test(`rejects ${scenario.title} @negative`, async ({ page, loginPage }) => {
      test.info().annotations.push({ type: 'risk', description: scenario.reason });

      await loginPage.login(scenario.username, scenario.password);

      // Generic message (no hint which field was wrong) and the user stays on the login page.
      // A failed login is a server round trip + full page reload; the shared demo can take >10s.
      await expect(loginPage.errorAlert).toHaveText('Invalid credentials', { timeout: 30_000 });
      await expect(page).toHaveURL(loginPage.path);
    });
  }

  test('shows "Required" validation when fields are empty @negative', async ({ page, loginPage }) => {
    await loginPage.loginButton.click();

    // Client-side validation: both fields flagged, no request sent, no navigation.
    await expect(loginPage.fieldErrors).toHaveCount(2);
    await expect(loginPage.fieldErrors).toHaveText(['Required', 'Required']);
    await expect(page).toHaveURL(loginPage.path);
  });

  test('redirects an unauthenticated user from a protected page to login @negative', async ({
    page,
    dashboardPage,
    loginPage,
  }) => {
    // Fresh browser context = no session cookie.
    await dashboardPage.open();

    await expect(page).toHaveURL(loginPage.path);
    await expect(loginPage.loginButton).toBeVisible();
  });
});
