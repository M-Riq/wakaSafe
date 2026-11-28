import { PILOT_CITIES, type PilotCity } from './config/business-rules';
import type { GeoPoint } from './entities/common';

export type Coordinates = Pick<GeoPoint, 'latitude' | 'longitude'>;

/** City centres of the pilot phase, used as the reference point of each zone. */
export const PILOT_CITY_CENTERS: Record<PilotCity, Coordinates> = {
  Yaoundé: { latitude: 3.848, longitude: 11.5021 },
  Douala: { latitude: 4.0483, longitude: 9.7043 },
  Bafoussam: { latitude: 5.4778, longitude: 10.4176 },
};

const EARTH_RADIUS_KM = 6371;

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** Great-circle distance (haversine formula), precise enough for distances within a country. */
export function distanceKm(a: Coordinates, b: Coordinates): number {
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.latitude)) * Math.cos(toRadians(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * F2.3 zone of a report — provisional: the nearest pilot city, so that no paid geocoding
 * service is needed (business-rules.md).
 */
export function nearestPilotCity(point: Coordinates): PilotCity {
  let nearest: PilotCity = PILOT_CITIES[0];
  let best = Number.POSITIVE_INFINITY;
  for (const city of PILOT_CITIES) {
    const distance = distanceKm(point, PILOT_CITY_CENTERS[city]);
    if (distance < best) {
      best = distance;
      nearest = city;
    }
  }
  return nearest;
}
