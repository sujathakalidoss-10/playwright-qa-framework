import { APIRequestContext, expect } from '@playwright/test';

export interface NewEmployee {
  firstName: string;
  lastName: string;
  employeeId: string;
}

/**
 * OrangeHRM's own REST API (/web/index.php/api/v2), used by UI tests for setup and clean-up only.
 *
 * It is built on the browser context's request object (page.request), so it shares the logged-in
 * session cookie: no separate authentication. Seeding through the API keeps UI tests focused on
 * the one screen they verify, and makes them faster and less flaky than seeding through forms.
 */
export class EmployeeClient {
  private static readonly path = '/web/index.php/api/v2/pim/employees';

  constructor(private readonly request: APIRequestContext) {}

  /** Creates an employee and returns its internal empNumber (needed for clean-up). */
  async create(employee: NewEmployee): Promise<number> {
    const response = await this.request.post(EmployeeClient.path, { data: employee });
    expect(response.status(), 'seeding an employee through the API').toBe(200);
    const body = (await response.json()) as { data: { empNumber: number } };
    return body.data.empNumber;
  }

  async delete(empNumbers: number[]): Promise<void> {
    if (empNumbers.length === 0) return;
    await this.request.delete(EmployeeClient.path, { data: { ids: empNumbers } });
  }
}
