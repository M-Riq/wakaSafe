import type { Clock, KeyValueStore } from '@wakasafe/data-contracts';

import { MockDatabaseSchema, type MockDatabase } from './schema';
import { createSeed } from './seed';

export const DATABASE_STORAGE_KEY = 'wakasafe.mock.db.v1';
export const SESSION_STORAGE_KEY = 'wakasafe.mock.session.v1';

/**
 * In-memory copy of the demo database, loaded lazily from the key/value store and
 * written back after every mutation. A missing or invalid document is replaced by a
 * fresh seed (e.g. after a schema change between two versions of the demo).
 */
export class MockDatabaseHandle {
  private cache: MockDatabase | null = null;
  private loading: Promise<MockDatabase> | null = null;
  private writes: Promise<void> = Promise.resolve();

  constructor(
    private readonly store: KeyValueStore,
    private readonly clock: Clock,
  ) {}

  read(): Promise<MockDatabase> {
    if (this.cache) return Promise.resolve(this.cache);
    this.loading ??= this.load();
    return this.loading;
  }

  /** Applies `mutate` to the database and persists the result. */
  async update<T>(mutate: (db: MockDatabase) => T): Promise<T> {
    const db = await this.read();
    const result = mutate(db);
    await this.persist(db);
    return result;
  }

  async reset(): Promise<void> {
    const seed = createSeed(this.clock.now());
    this.cache = seed;
    this.loading = Promise.resolve(seed);
    await this.persist(seed);
  }

  private async load(): Promise<MockDatabase> {
    const stored = await this.readStored();
    if (stored) {
      this.cache = stored;
      return stored;
    }
    const seed = createSeed(this.clock.now());
    this.cache = seed;
    await this.persist(seed);
    return seed;
  }

  private async readStored(): Promise<MockDatabase | null> {
    const raw = await this.store.get(DATABASE_STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = MockDatabaseSchema.safeParse(JSON.parse(raw));
      return parsed.success ? parsed.data : null;
    } catch {
      return null;
    }
  }

  private persist(db: MockDatabase): Promise<void> {
    const serialized = JSON.stringify(db);
    // Writes are serialised; a failed write must not block the following ones.
    const write = this.writes
      .catch(() => undefined)
      .then(() => this.store.set(DATABASE_STORAGE_KEY, serialized));
    this.writes = write;
    return write;
  }
}
