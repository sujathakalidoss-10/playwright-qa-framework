import { test, expect } from '../../src/fixtures';
import { anEmployee, uniqueEmployeeId } from '../../src/data/employeeData';

/**
 * Feature under test: OrangeHRM PIM - add an employee and find them in the employee list.
 *
 * Why PIM: managing employee records is the core job of an HR system. Every other module
 * (leave, time, performance) hangs off an employee record.
 *
 * Layering in practice: tests start logged in (session saved by auth.setup.ts), seed data through
 * OrangeHRM's REST API, and delete what they created through the API. The browser is used only for
 * the screens being verified.
 */
test.describe('OrangeHRM UI - PIM employees', () => {
  test('admin adds an employee and finds them in the employee list @smoke', async ({
    page,
    addEmployeePage,
    employeeListPage,
    employeeCleanup,
  }) => {
    const employee = anEmployee();
    const fullName = `${employee.firstName} ${employee.lastName}`;

    await test.step('fill in and save the Add Employee form', async () => {
      await addEmployeePage.open();
      await addEmployeePage.fill(employee);
      await addEmployeePage.save();
    });

    await test.step('lands on the new employee\'s Personal Details page', async () => {
      await expect(page.getByText('Successfully Saved')).toBeVisible();
      // Register for clean-up as soon as the record exists, so a later failure still deletes it.
      employeeCleanup.push(await addEmployeePage.waitForSavedEmployee());
      await expect(page.getByRole('heading', { name: fullName })).toBeVisible();
    });

    await test.step('the employee is found by Employee Id in the list', async () => {
      await employeeListPage.open();
      await employeeListPage.searchByEmployeeId(employee.employeeId);

      await expect(employeeListPage.recordCount).toHaveText('(1) Record Found');
      const row = employeeListPage.rowFor(employee.employeeId);
      await expect(row.getByRole('cell', { name: employee.firstName, exact: true })).toBeVisible();
      await expect(row.getByRole('cell', { name: employee.lastName, exact: true })).toBeVisible();
    });
  });

  test('shows "Required" for first and last name when saving an empty form @negative', async ({
    page,
    addEmployeePage,
  }) => {
    await addEmployeePage.open();
    await addEmployeePage.save();

    await expect(addEmployeePage.fieldErrors).toHaveText(['Required', 'Required']);
    await expect(page).toHaveURL(addEmployeePage.path);
  });

  test('rejects a duplicate Employee Id @negative', async ({
    page,
    addEmployeePage,
    employeeApi,
    employeeCleanup,
  }) => {
    // Arrange through the API: the existing employee is setup, not what this test verifies.
    const existing = anEmployee();
    employeeCleanup.push(await employeeApi.create(existing));

    await addEmployeePage.open();
    await addEmployeePage.fill(anEmployee({ employeeId: existing.employeeId }));

    // The Id is checked as soon as it is typed, before Save.
    await expect(addEmployeePage.fieldErrors).toHaveText('Employee Id already exists');

    await addEmployeePage.save();
    await expect(page).toHaveURL(addEmployeePage.path);
  });

  test('shows "No Records Found" when searching for an unknown Employee Id @negative', async ({
    employeeListPage,
  }) => {
    await employeeListPage.open();
    await employeeListPage.searchByEmployeeId(uniqueEmployeeId());

    await expect(employeeListPage.recordCount).toHaveText('No Records Found');
    await expect(employeeListPage.resultRows).toHaveCount(0);
  });
});
