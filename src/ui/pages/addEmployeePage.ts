import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './basePage';
import { NewEmployee } from '../api/employeeClient';

/** PIM → Add Employee. */
export class AddEmployeePage extends BasePage {
  readonly path = '/web/index.php/pim/addEmployee';

  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly employeeIdInput: Locator;
  readonly saveButton: Locator;
  readonly fieldErrors: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.getByPlaceholder('First Name');
    this.lastNameInput = page.getByPlaceholder('Last Name');
    // The Employee Id input has no accessible name, so scope it by its visible label.
    this.employeeIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.fieldErrors = page.locator('.oxd-input-field-error-message');
  }

  /**
   * The form is only usable once the app has pre-filled the next free Employee Id.
   * Clicking Save before that is silently ignored, so wait for it instead of sleeping.
   */
  override async open(): Promise<void> {
    await super.open();
    await expect(this.employeeIdInput).not.toHaveValue('');
  }

  async fill(employee: NewEmployee): Promise<void> {
    await this.firstNameInput.fill(employee.firstName);
    await this.lastNameInput.fill(employee.lastName);
    await this.employeeIdInput.fill(employee.employeeId);
  }

  async save(): Promise<void> {
    await this.saveButton.click();
  }

  /**
   * After a successful save the app opens the employee's Personal Details page,
   * whose URL ends in the new record's internal number. Returns that number (used for clean-up).
   */
  async waitForSavedEmployee(): Promise<number> {
    await this.page.waitForURL('**/pim/viewPersonalDetails/empNumber/*');
    return Number(this.page.url().split('/').pop());
  }
}
