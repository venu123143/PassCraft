import { Pass } from '../../src/passes/entities/pass.entity';
import { PassRepository } from '../../src/passes/interfaces/pass-repository.interface';

/** Test double: stores snapshots so callers can't mutate stored state by reference. */
export class InMemoryPassRepository implements PassRepository {
  private readonly store = new Map<string, ReturnType<Pass['toSnapshot']>>();

  save(pass: Pass): Promise<void> {
    this.store.set(pass.id, pass.toSnapshot());
    return Promise.resolve();
  }

  findById(id: string): Promise<Pass | null> {
    const snapshot = this.store.get(id);
    return Promise.resolve(snapshot ? Pass.restore(snapshot) : null);
  }

  delete(id: string): Promise<void> {
    this.store.delete(id);
    return Promise.resolve();
  }

  get size(): number {
    return this.store.size;
  }
}
