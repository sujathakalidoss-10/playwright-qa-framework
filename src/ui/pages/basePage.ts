import { Page } from '@playwright/test';

/**
 * Shared behaviour for every page object. Kept deliberately thin:
 * page objects expose user-level actions and locators, but assertions live in tests.
 */
export abstract class BasePage {
  /** App-relative URL of the page; resolved against baseURL by goto() and toHaveURL(). */
  abstract readonly path: string;

  constructor(protected readonly page: Page) {}

  async open(): Promise<void> {
    await this.page.goto(this.path);
  }
}
