import type { ReportFilters } from '@wakasafe/data-contracts';
import {
  PUBLIC_REPORT_STATUSES,
  PILOT_CITY_CENTERS,
  type PilotCity,
  type ReportCategory,
  type Severity,
} from '@wakasafe/domain';

import type { MapPoint } from '@/ui/map';

/** F2.3 public map filters: type, severity and zone. */
export interface MapFilters {
  categories: ReportCategory[];
  severities: Severity[];
  city: PilotCity | null;
}

export const NO_FILTERS: MapFilters = { categories: [], severities: [], city: null };

export function toggleValue<T>(values: readonly T[], value: T): T[] {
  return values.includes(value) ? values.filter((v) => v !== value) : [...values, value];
}

export function activeFilterCount({ categories, severities, city }: MapFilters): number {
  return categories.length + severities.length + (city ? 1 : 0);
}

export function toPublicReportFilters({ categories, severities, city }: MapFilters): ReportFilters {
  return {
    statuses: [...PUBLIC_REPORT_STATUSES],
    categories,
    severities,
    ...(city ? { city } : {}),
  };
}

/** The three pilot cities fit in this view; a zone filter zooms on its city. */
const PILOT_REGION: { center: MapPoint; zoom: number } = {
  center: { latitude: 4.55, longitude: 10.6 },
  zoom: 7,
};
const CITY_ZOOM = 12;

export function mapViewFor(city: PilotCity | null): { center: MapPoint; zoom: number } {
  return city ? { center: PILOT_CITY_CENTERS[city], zoom: CITY_ZOOM } : PILOT_REGION;
}
