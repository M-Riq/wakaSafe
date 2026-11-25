/** Local key/value persistence injected into the mock repositories (AsyncStorage, memory...). */
export interface KeyValueStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
}

/** Injected time source, so that business rules and tests do not depend on the real clock. */
export interface Clock {
  now(): Date;
}
