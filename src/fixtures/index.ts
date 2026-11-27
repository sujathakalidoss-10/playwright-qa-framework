import { test as base, expect } from '@playwright/test';
import { PetClient } from '../api/clients/petClient';
import { LoginPage } from '../ui/pages/loginPage';
import { DashboardPage } from '../ui/pages/dashboardPage';
import { AddEmployeePage } from '../ui/pages/addEmployeePage';
import { EmployeeListPage } from '../ui/pages/employeeListPage';
import { EmployeeClient } from '../ui/api/employeeClient';

/**
 * Custom fixtures = dependency injection for tests.
 * Tests declare what they need ({ petClient, loginPage }) and Playwright builds it,
 * which removes setup boilerplate and gives every test isolated instances.
 */
type Fixtures = {
  petClient: PetClient;
  /** Register pet ids here; they are deleted after the test even if it fails. */
  petCleanup: number[];
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  addEmployeePage: AddEmployeePage;
  employeeListPage: EmployeeListPage;
  /** OrangeHRM REST API on the browser's session - for UI test setup and clean-up. */
  employeeApi: EmployeeClient;
  /** Register OrangeHRM empNumbers here; they are deleted after the test even if it fails. */
  employeeCleanup: number[];
};

export const test = base.extend<Fixtures>({
  petClient: async ({ request }, use) => {
    await use(new PetClient(request));
  },

  petCleanup: async ({ petClient }, use) => {
    const ids: number[] = [];
    await use(ids);
    // Teardown: keep the shared sandbox tidy. Failures here must not mask the real result.
    for (const id of ids) {
      await petClient.delete(id).catch(() => undefined);
    }
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  addEmployeePage: async ({ page }, use) => {
    await use(new AddEmployeePage(page));
  },

  employeeListPage: async ({ page }, use) => {
    await use(new EmployeeListPage(page));
  },

  employeeApi: async ({ page }, use) => {
    await use(new EmployeeClient(page.request));
  },

  employeeCleanup: async ({ employeeApi }, use) => {
    const empNumbers: number[] = [];
    await use(empNumbers);
    // Teardown: keep the shared demo tidy. Failures here must not mask the real result.
    await employeeApi.delete(empNumbers).catch(() => undefined);
  },
});

export { expect };
