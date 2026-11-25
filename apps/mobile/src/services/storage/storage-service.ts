import AsyncStorage from '@react-native-async-storage/async-storage';
import type { KeyValueStore } from '@wakasafe/data-contracts';

/**
 * Local key-value storage. AsyncStorage uses SQLite on Android and localStorage on the
 * web, so one implementation serves both targets.
 */
export type StorageService = KeyValueStore;

export function createAsyncStorageService(): StorageService {
  return {
    get: (key) => AsyncStorage.getItem(key),
    set: (key, value) => AsyncStorage.setItem(key, value),
    remove: (key) => AsyncStorage.removeItem(key),
  };
}
