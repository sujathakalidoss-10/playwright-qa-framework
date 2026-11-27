import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

export class DashboardPage extends BasePage {
  readonly path = '/web/index.php/dashboard/index';

  readonly heading: Locator;
  readonly userMenu: Locator;
  readonly logoutLink: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Dashboard' });
    this.userMenu = page.locator('.oxd-userdropdown-tab');
    this.logoutLink = page.getByRole('menuitem', { name: 'Logout' });
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    // Logout triggers a server round trip (/auth/logout -> redirect to /auth/login). On the shared
    // demo that navigation can exceed the 15s actionTimeout, which the click would otherwise spend
    // waiting for it. Don't tie the click to the navigation; wait for it with the navigation budget.
    await Promise.all([
      this.page.waitForURL('**/auth/login',{ timeout: 30_000 }),
      this.logoutLink.click({ noWaitAfter: true }),
    ]);
  }
}
