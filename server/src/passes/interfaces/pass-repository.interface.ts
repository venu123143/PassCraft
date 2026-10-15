import { Pass } from '../entities/pass.entity';

/**
 * Persistence port for passes. Declared as an abstract class so it can be
 * used directly as a Nest DI token.
 */
export abstract class PassRepository {
  /** Inserts or updates the pass. */
  abstract save(pass: Pass): Promise<void>;

  abstract findById(id: string): Promise<Pass | null>;

  abstract delete(id: string): Promise<void>;
}
