import { Pet, PetStatus } from '../models/pet';

/**
 * Generates an id that is very unlikely to collide on the shared public Petstore,
 * where other candidates and bots create pets all the time.
 */
export function uniquePetId(): number {
  return Number(`${Date.now()}${Math.floor(Math.random() * 1000)}`.slice(-15));
}

/**
 * Builder pattern for test data: every test starts from a valid default
 * and overrides only the fields relevant to its scenario.
 * This keeps tests short and makes the *intent* of each test obvious.
 */
export class PetBuilder {
  private pet: Pet;

  constructor() {
    const id = uniquePetId();
    this.pet = {
      id,
      category: { id: 1, name: 'Dogs' },
      name: `qa-pet-${id}`,
      photoUrls: ['https://example.com/photos/dog.png'],
      tags: [{ id: 1, name: 'automation' }],
      status: 'available',
    };
  }

  static aPet(): PetBuilder {
    return new PetBuilder();
  }

  withStatus(status: PetStatus): this {
    this.pet.status = status;
    return this;
  }

  build(): Pet {
    return structuredClone(this.pet);
  }
}
