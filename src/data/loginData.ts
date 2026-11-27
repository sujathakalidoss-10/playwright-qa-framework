import { env } from '../../config/env';

/**
 * Data-driven negative login cases. Adding a case = adding a row, no new test code.
 * Each row documents *why* it exists so reviewers see the risk being covered.
 */
export interface InvalidLoginCase {
  title: string;
  username: string;
  password: string;
  reason: string;
}

export const invalidLoginCases: InvalidLoginCase[] = [
  {
    title: 'valid username with wrong password',
    username: env.orangeHrm.username,
    password: 'wrong-password-123',
    reason: 'Most common real-world failure; must not reveal which field was wrong',
  },
  {
    title: 'unknown username',
    username: `no_such_user_${Date.now()}`,
    password: env.orangeHrm.password,
    reason: 'Guards against user enumeration - same generic message expected',
  },
  {
    title: 'SQL-injection style input',
    username: "' OR '1'='1",
    password: "' OR '1'='1",
    reason: 'Basic security smoke check: injection payload must be rejected cleanly',
  },
  {
    title: 'password with surrounding whitespace',
    username: env.orangeHrm.username,
    password: ` ${env.orangeHrm.password} `,
    reason: 'Passwords must be compared exactly, not trimmed',
  },
];
