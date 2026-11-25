import type { Clock, KeyValueStore } from '@wakasafe/data-contracts';

import type { MockDatabaseHandle } from '../database';

/** Dependencies shared by every mock repository. */
export interface MockContext {
  db: MockDatabaseHandle;
  store: KeyValueStore;
  clock: Clock;
  /** Simulated network latency. */
  wait: () => Promise<void>;
}
