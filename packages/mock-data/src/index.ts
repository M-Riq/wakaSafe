import type { Clock, KeyValueStore, Repositories } from '@wakasafe/data-contracts';

import { MockDatabaseHandle, SESSION_STORAGE_KEY } from './database';
import {
  createAgencyRepository,
  createProfileRequestRepository,
  createUserRepository,
} from './repositories/accounts';
import { createAuthRepository } from './repositories/auth';
import type { MockContext } from './repositories/context';
import {
  createModerationRepository,
  createNotificationRepository,
  createPointsRepository,
  createQuizRepository,
  createRatingRepository,
  createReportRepository,
  createStatsRepository,
} from './repositories/later-phases';
import { createDelay } from './utils';

export { DATABASE_STORAGE_KEY, SESSION_STORAGE_KEY } from './database';
export { DEMO_ACCOUNTS, DEMO_PASSWORD, DEMO_USER_IDS, type DemoAccount } from './demo-accounts';
export { MockDatabaseSchema, type MockDatabase } from './schema';
export { createSeed } from './seed';

export interface MockRepositoriesOptions {
  store: KeyValueStore;
  clock?: Clock;
  /** Simulated network latency in milliseconds (0 in tests). */
  latencyMs?: number;
}

export interface MockRepositories extends Repositories {
  /** Restores the demo dataset and signs the user out. */
  resetDemo(): Promise<void>;
}

export const systemClock: Clock = { now: () => new Date() };

export function createMockRepositories({
  store,
  clock = systemClock,
  latencyMs = 0,
}: MockRepositoriesOptions): MockRepositories {
  const context: MockContext = {
    db: new MockDatabaseHandle(store, clock),
    store,
    clock,
    wait: createDelay(latencyMs),
  };
  return {
    auth: createAuthRepository(context),
    users: createUserRepository(context),
    profileRequests: createProfileRequestRepository(context),
    agencies: createAgencyRepository(context),
    reports: createReportRepository(),
    moderation: createModerationRepository(),
    quiz: createQuizRepository(),
    points: createPointsRepository(),
    ratings: createRatingRepository(),
    notifications: createNotificationRepository(),
    stats: createStatsRepository(),
    async resetDemo() {
      await store.remove(SESSION_STORAGE_KEY);
      await context.db.reset();
    },
  };
}

/** Volatile store, for tests and environments without persistence. */
export function createMemoryKeyValueStore(initial: Record<string, string> = {}): KeyValueStore {
  const values = new Map(Object.entries(initial));
  return {
    get: async (key) => values.get(key) ?? null,
    set: async (key, value) => {
      values.set(key, value);
    },
    remove: async (key) => {
      values.delete(key);
    },
  };
}
