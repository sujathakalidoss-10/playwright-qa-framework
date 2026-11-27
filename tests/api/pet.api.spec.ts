import { test, expect } from '../../src/fixtures';
import { PetBuilder, uniquePetId } from '../../src/api/builders/petBuilder';
import { ApiErrorSchema, PetSchema, PetStatus } from '../../src/api/models/pet';

/**
 * Endpoint under test: POST /pet  (Swagger Petstore - "Add a new pet to the store")
 * Read-back verification uses GET /pet/{petId}.
 *
 * Why this endpoint: creation is the highest-risk operation on the resource - every other
 * operation (find, update, delete, order) depends on a pet being created correctly.
 */
test.describe('Petstore API - POST /pet', () => {
  test.describe('positive', () => {
    test('creates a pet and it can be read back @smoke', async ({ petClient, petCleanup }) => {
      const newPet = PetBuilder.aPet().build();
      petCleanup.push(newPet.id);

      // Act
      const createResponse = await petClient.create(newPet);

      // Assert - status, headers, contract, and data
      expect(createResponse.status()).toBe(200);
      expect(createResponse.headers()['content-type']).toContain('application/json');
      const created = PetSchema.parse(await createResponse.json());
      expect(created).toEqual(newPet);

      // Read-back: the public Petstore runs several nodes behind a load balancer and is
      // eventually consistent, so poll rather than asserting once (a fixed sleep would be slower and still flaky).
      await expect
        .poll(async () => (await petClient.getById(newPet.id)).status(), {
          message: `pet ${newPet.id} should become readable`,
          intervals: [500, 1_000, 2_000],
          timeout: 15_000,
        })
        .toBe(200);

      const fetched = PetSchema.parse(await (await petClient.getById(newPet.id)).json());
      expect(fetched).toEqual(newPet);
    });

    // Data-driven: every enum value in the spec must be accepted and echoed back.
    for (const status of PetStatus.options) {
      test(`accepts status "${status}"`, async ({ petClient, petCleanup }) => {
        const pet = PetBuilder.aPet().withStatus(status).build();
        petCleanup.push(pet.id);

        const response = await petClient.create(pet);

        expect(response.status()).toBe(200);
        expect(PetSchema.parse(await response.json()).status).toBe(status);
      });
    }
  });

  test.describe('negative', () => {
    test('rejects a malformed JSON body with 400 @negative', async ({ petClient }) => {
      const response = await petClient.create('{ "name": "broken-json", ');

      expect(response.status()).toBe(400);
      const error = ApiErrorSchema.parse(await response.json());
      expect(error.message).toBe('bad input');
    });

    test('rejects a wrong data type for id @negative', async ({ petClient }) => {
      const pet = { ...PetBuilder.aPet().build(), id: 'not-a-number' };

      const response = await petClient.create(pet);

      // Must never succeed. Ideally 400 (client error); a 5xx means the server crashed on
      // bad input instead of validating it - we record that as a defect rather than hide it.
      expect(response.ok(), 'invalid payload must not be accepted').toBeFalsy();
      if (response.status() >= 500) {
        test.info().annotations.push({
          type: 'defect',
          description: `Invalid id type returned ${response.status()} instead of 400 (input not validated)`,
        });
      }
    });

    test('rejects a pet missing required fields (name, photoUrls) @negative @known-defect', async ({
      petClient,
      petCleanup,
    }) => {
      // The spec marks name and photoUrls as required and documents 405 "Invalid input".
      // The public Petstore does not enforce this. test.fail() keeps the suite green while
      // making the gap visible in the report - and it flips red the day the API is fixed,
      // telling us to remove the marker.
      test.fail(true, 'Known defect: Petstore accepts pets without required fields');

      const id = uniquePetId();
      petCleanup.push(id);

      const response = await petClient.create({ id });

      expect(response.status()).toBeGreaterThanOrEqual(400);
    });

    test('returns 404 "Pet not found" for an id that does not exist @negative', async ({ petClient }) => {
      const response = await petClient.getById(uniquePetId());

      expect(response.status()).toBe(404);
      const error = ApiErrorSchema.parse(await response.json());
      expect(error.message).toBe('Pet not found');
    });

    test('rejects a non-numeric pet id with a client error @negative', async ({ petClient }) => {
      const response = await petClient.getById('abc');

      // Spec says 400 "Invalid ID supplied"; implementation returns 404. Assert the
      // behaviour that matters (a 4xx, never 2xx/5xx) and annotate the spec deviation.
      expect(response.status()).toBeGreaterThanOrEqual(400);
      expect(response.status()).toBeLessThan(500);
      if (response.status() !== 400) {
        test.info().annotations.push({
          type: 'spec-deviation',
          description: `Expected 400 per Swagger spec, got ${response.status()}`,
        });
      }
    });
  });
});
