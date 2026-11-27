import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Page Object for the OrangeHRM login screen.
 *
 * Locator strategy (in order of preference):
 *   1. user-facing roles / labels / placeholders (resilient, mirrors how users see the page)
 *   2. stable CSS hooks only where the app offers nothing better (error alert, field errors)
 */
export class LoginPage extends BasePage {
  readonly path = '/web/index.php/auth/login';

  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorAlert: Locator;
  readonly fieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorAlert = page.locator('.oxd-alert-content-text');
    this.fieldErrors = page.locator('.oxd-input-field-error-message');
  }

  async login(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
