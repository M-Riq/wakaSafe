import type { Repositories } from '@wakasafe/data-contracts';
import type { Role } from '@wakasafe/domain';
import { createMockRepositories, DEMO_ACCOUNTS, DEMO_PASSWORD } from '@wakasafe/mock-data';

import { getAppConfig } from '@/lib/config';
import { createAsyncStorageService, type StorageService } from '@/services/storage';

export interface DemoAccountInfo {
  userId: string;
  phone: string;
  role: Role;
  label: string;
  description: string;
}

/** Demo helpers, only available with mock data (null once a real backend is plugged in). */
export interface DemoTools {
  accounts: readonly DemoAccountInfo[];
  password: string;
  /** Restores the demo dataset and signs the user out. */
  reset(): Promise<void>;
}

export interface AppData {
  repositories: Repositories;
  demo: DemoTools | null;
}

/**
 * Composition root (ADR-0005): the only place that chooses a repository implementation.
 * Plugging in a real API in phase 12 only changes this function.
 */
export function createAppData(storage: StorageService = createAsyncStorageService()): AppData {
  const { dataSource, mockLatencyMs } = getAppConfig();
  if (dataSource !== 'mock') {
    throw new Error(`Unsupported data source "${dataSource}". Only "mock" exists before phase 12.`);
  }
  const { resetDemo, ...repositories } = createMockRepositories({
    store: storage,
    latencyMs: mockLatencyMs,
  });
  return {
    repositories,
    demo: {
      accounts: DEMO_ACCOUNTS.filter((account) => account.app === 'client'),
      password: DEMO_PASSWORD,
      reset: resetDemo,
    },
  };
}
