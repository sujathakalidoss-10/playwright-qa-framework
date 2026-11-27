import { Locator, Page } from '@playwright/test';
import { BasePage } from './basePage';

/** PIM → Employee List (search). */
export class EmployeeListPage extends BasePage {
  readonly path = '/web/index.php/pim/viewEmployeeList';

  readonly employeeIdInput: Locator;
  readonly searchButton: Locator;
  readonly resultRows: Locator;
  readonly recordCount: Locator;

  constructor(page: Page) {
    super(page);
    this.employeeIdInput = page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
    this.searchButton = page.getByRole('button', { name: 'Search' });
    // Data rows only: the header row lives in a separate rowgroup.
    this.resultRows = page.locator('.oxd-table-body').getByRole('row');
    // Scoped to the list header: the same text also pops up in a toast notification.
    this.recordCount = page.locator('.orangehrm-horizontal-padding').getByText(/Records? Found/);
  }

  async searchByEmployeeId(employeeId: string): Promise<void> {
    await this.employeeIdInput.fill(employeeId);
    await this.searchButton.click();
  }

  /** The result row for an employee, matched on its Employee Id cell. */
  rowFor(employeeId: string): Locator {
    return this.resultRows.filter({ has: this.page.getByRole('cell', { name: employeeId, exact: true }) });
  }
}
