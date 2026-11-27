import { z } from 'zod';

/**
 * Contract for the Pet resource, taken from the Swagger Petstore spec.
 * The zod schema is both the TypeScript type and a runtime response validator,
 * so a contract break (missing field, wrong type) fails the test with a clear message.
 */
export const PetStatus = z.enum(['available', 'pending', 'sold']);
export type PetStatus = z.infer<typeof PetStatus>;

const Category = z.object({
  id: z.number().int(),
  name: z.string(),
});

const Tag = z.object({
  id: z.number().int(),
  name: z.string(),
});

export const PetSchema = z.object({
  id: z.number().int(),
  category: Category.optional(),
  name: z.string(),
  photoUrls: z.array(z.string()),
  tags: z.array(Tag).optional(),
  status: PetStatus.optional(),
});
export type Pet = z.infer<typeof PetSchema>;

/** Petstore's generic error envelope, e.g. { code: 1, type: "error", message: "Pet not found" } */
export const ApiErrorSchema = z.object({
  code: z.number().int(),
  type: z.string(),
  message: z.string(),
});
export type ApiError = z.infer<typeof ApiErrorSchema>;
