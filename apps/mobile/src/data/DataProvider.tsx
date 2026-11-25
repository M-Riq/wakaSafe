import type { Repositories } from '@wakasafe/data-contracts';
import { createContext, useContext, useState, type ReactNode } from 'react';

import { createAppData, type AppData, type DemoTools } from './app-data';

const DataContext = createContext<AppData | null>(null);

interface DataProviderProps {
  children: ReactNode;
  /** Injected in tests; created from the configuration otherwise. */
  data?: AppData;
}

export function DataProvider({ children, data }: DataProviderProps) {
  const [value] = useState(() => data ?? createAppData());
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

function useAppData(): AppData {
  const value = useContext(DataContext);
  if (!value) throw new Error('DataProvider is missing');
  return value;
}

/** Repository interfaces: the only data access allowed in features. */
export function useRepositories(): Repositories {
  return useAppData().repositories;
}

export function useDemoTools(): DemoTools | null {
  return useAppData().demo;
}
