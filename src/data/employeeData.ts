import { NewEmployee } from '../ui/api/employeeClient';

/**
 * Employee Id must be unique and OrangeHRM limits it to 10 characters.
 * Time + random digits keeps it unique on the shared demo, where many people add employees.
 */
export function uniqueEmployeeId(): string {
  return `${Date.now()}`.slice(-7) + `${Math.floor(Math.random() * 1000)}`.padStart(3, '0');
}

/** A valid employee with a unique Id; override only what the scenario cares about. */
export function anEmployee(overrides: Partial<NewEmployee> = {}): NewEmployee {
  const employeeId = uniqueEmployeeId();
  return {
    firstName: 'QA',
    lastName: `Auto${employeeId}`,
    employeeId,
    ...overrides,
  };
}
