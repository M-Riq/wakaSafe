import type { GeoPoint } from '@wakasafe/domain';
import * as Location from 'expo-location';

export type LocateResult =
  { status: 'located'; point: GeoPoint } | { status: 'denied' } | { status: 'unavailable' };

/** Beyond this delay the form offers to choose the position by hand. */
const LOCATE_TIMEOUT_MS = 20_000;

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<null>((resolve) => {
    timer = setTimeout(() => resolve(null), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * F2.2 automatic GPS position, with the foreground permission only. Works on Android and in
 * browsers (HTTPS or localhost); any failure lets the user place the report by hand.
 */
export async function locateDevice(): Promise<LocateResult> {
  try {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) return { status: 'denied' };
    const position = await withTimeout(
      Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High }),
      LOCATE_TIMEOUT_MS,
    );
    if (!position) return { status: 'unavailable' };
    const { latitude, longitude, accuracy } = position.coords;
    return {
      status: 'located',
      point: {
        latitude,
        longitude,
        accuracyMeters: accuracy === null ? null : Math.round(accuracy),
      },
    };
  } catch {
    return { status: 'unavailable' };
  }
}
