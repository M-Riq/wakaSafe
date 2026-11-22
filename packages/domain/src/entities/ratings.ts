import { z } from 'zod';

import { BUSINESS_RULES } from '../config/business-rules';
import { IdSchema, IsoDateTimeSchema } from './common';

// M6 driver ratings (F6.1 to F6.4).

/** The 4 criteria of F6.1. */
export const RATING_CRITERIA = [
  'courtesy',
  'punctuality',
  'safeDriving',
  'vehicleCleanliness',
] as const;
export type RatingCriterion = (typeof RATING_CRITERIA)[number];

export const RatingScoreSchema = z
  .number()
  .int()
  .min(BUSINESS_RULES.ratings.minScore)
  .max(BUSINESS_RULES.ratings.maxScore);

export const RatingSchema = z.object({
  id: IdSchema,
  passengerId: IdSchema,
  driverId: IdSchema,
  /** Agency of the driver at the time of the rating. */
  agencyId: IdSchema,
  courtesy: RatingScoreSchema,
  punctuality: RatingScoreSchema,
  safeDriving: RatingScoreSchema,
  vehicleCleanliness: RatingScoreSchema,
  /** Anti-abuse period (F6.3), see `ratingPeriodKey`. */
  periodKey: z.string().min(1),
  createdAt: IsoDateTimeSchema,
});
export type Rating = z.infer<typeof RatingSchema>;

export type RatingScores = Pick<Rating, RatingCriterion>;

export function ratingAverage(scores: RatingScores): number {
  const total = RATING_CRITERIA.reduce((sum, criterion) => sum + scores[criterion], 0);
  return total / RATING_CRITERIA.length;
}
