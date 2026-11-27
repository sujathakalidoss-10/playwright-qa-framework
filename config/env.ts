import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

/**
 * Single source of truth for environment configuration.
 * Tests never read process.env directly - they import from here,
 * so switching environment (dev / staging / demo) is a .env or CI variable change only.
 */
export const env = {
  petstore: {
    // Trailing slash matters: Playwright resolves relative paths with `new URL()`,
    // so 'pet' + 'https://host/v2/' => 'https://host/v2/pet'.
    baseUrl: process.env.PETSTORE_BASE_URL ?? 'https://petstore.swagger.io/v2/',
    apiKey: process.env.PETSTORE_API_KEY ?? 'special-key',
  },
  orangeHrm: {
    baseUrl: process.env.ORANGEHRM_BASE_URL ?? 'https://opensource-demo.orangehrmlive.com',
    username: process.env.ORANGEHRM_USERNAME ?? 'Admin',
    password: process.env.ORANGEHRM_PASSWORD ?? 'admin123',
  },
} as const;

/** Where the UI setup project saves the logged-in admin session (git-ignored). */
export const adminStorageState = path.resolve(__dirname, '..', '.auth', 'admin.json');
