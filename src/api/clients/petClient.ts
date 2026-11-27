import { APIRequestContext, APIResponse } from '@playwright/test';
import { env } from '../../../config/env';

/**
 * Service-object (API client) for the /pet resource.
 *
 * Tests talk to this class, never to raw URLs. If the API path, auth header
 * or version changes, only this file changes.
 *
 * Paths are relative WITHOUT a leading slash so they resolve under baseURL's /v2/.
 */
export class PetClient {
  constructor(private readonly request: APIRequestContext) {}

  /** POST /pet - body may be an object, or a raw string for malformed-payload tests. */
  async create(body: object | string): Promise<APIResponse> {
    return this.request.post('pet', {
      // Strings go out as raw bytes: with a JSON content type Playwright would otherwise
      // serialise the string itself into a JSON string literal, which is not the payload we meant.
      data: typeof body === 'string' ? Buffer.from(body, 'utf-8') : body,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  /** GET /pet/{petId} - accepts string so we can send invalid ids on purpose. */
  async getById(petId: number | string): Promise<APIResponse> {
    return this.request.get(`pet/${petId}`);
  }

  /** DELETE /pet/{petId} - used for test-data clean-up. */
  async delete(petId: number | string): Promise<APIResponse> {
    return this.request.delete(`pet/${petId}`, {
      headers: { api_key: env.petstore.apiKey },
    });
  }
}
