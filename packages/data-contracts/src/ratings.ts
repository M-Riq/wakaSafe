import type { Agency, Driver, Id, IsoDateTime, Rating, RatingScores } from '@wakasafe/domain';

// M6 driver and agency ratings.

export interface DriverSummary {
  driver: Driver;
  displayName: string;
  agency: Agency;
  ratingCount: number;
  /** Average per criterion, null when the driver has no rating yet. */
  averages: RatingScores | null;
  overallAverage: number | null;
}

export interface AgencySummary {
  agency: Agency;
  driverCount: number;
  ratingCount: number;
  overallAverage: number | null;
}

/** F6.3 — one rating per (passenger, driver, period). */
export interface RatingEligibility {
  canRate: boolean;
  reason: 'OK' | 'ALREADY_RATED' | 'SELF_RATING' | 'READ_ONLY';
  /** When the passenger may rate this driver again. */
  nextAllowedAt: IsoDateTime | null;
}

export interface SubmitRatingInput {
  passengerId: Id;
  driverId: Id;
  scores: RatingScores;
}

/** F6.4 — the driver's own statistics (passenger identities are never exposed). */
export interface DriverStats {
  summary: DriverSummary;
  /** Monthly trend, oldest first. */
  monthly: { monthKey: string; ratingCount: number; overallAverage: number | null }[];
  rankInAgency: number | null;
}

export interface DriverListFilters {
  agencyId?: Id;
  search?: string;
}

export interface RatingRepository {
  getRatingEligibility(input: { passengerId: Id; driverId: Id }): Promise<RatingEligibility>;
  submit(input: SubmitRatingInput): Promise<Rating>;
  /** F6.2 public ranking, best average first. */
  listDrivers(filters?: DriverListFilters): Promise<DriverSummary[]>;
  listAgencies(): Promise<AgencySummary[]>;
  getDriverStats(driverId: Id): Promise<DriverStats>;
}
