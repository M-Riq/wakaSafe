import { z } from 'zod';

import { IdSchema, IsoDateTimeSchema } from './common';

// M5 points and leaderboards (F5.3, F5.4).

export const PointReasonSchema = z.enum([
  'REPORT_VALIDATED',
  'QUIZ_CORRECT_ANSWER',
  'RATING_SUBMITTED',
]);
export type PointReason = z.infer<typeof PointReasonSchema>;

/** Kind of action referenced by `PointEntry.sourceId` (traceability, F5.3). */
export const PointSourceTypeSchema = z.enum(['REPORT', 'QUIZ_ATTEMPT', 'RATING']);
export type PointSourceType = z.infer<typeof PointSourceTypeSchema>;

export const POINT_SOURCE_TYPE_BY_REASON: Readonly<Record<PointReason, PointSourceType>> = {
  REPORT_VALIDATED: 'REPORT',
  QUIZ_CORRECT_ANSWER: 'QUIZ_ATTEMPT',
  RATING_SUBMITTED: 'RATING',
};

export const LeaderboardPeriodSchema = z.enum(['MONTHLY', 'ANNUAL']);
export type LeaderboardPeriod = z.infer<typeof LeaderboardPeriodSchema>;

export const PointEntrySchema = z
  .object({
    id: IdSchema,
    userId: IdSchema,
    reason: PointReasonSchema,
    points: z.number().int(),
    sourceType: PointSourceTypeSchema,
    sourceId: IdSchema,
    createdAt: IsoDateTimeSchema,
  })
  .refine((e) => POINT_SOURCE_TYPE_BY_REASON[e.reason] === e.sourceType, {
    message: 'sourceType does not match reason',
    path: ['sourceType'],
  });
export type PointEntry = z.infer<typeof PointEntrySchema>;

export const LeaderboardEntrySchema = z.object({
  userId: IdSchema,
  rank: z.number().int().positive(),
  points: z.number().int(),
  period: LeaderboardPeriodSchema,
  /** "YYYY-MM" (monthly) or "YYYY" (annual), Africa/Douala time zone. */
  periodKey: z.string().regex(/^\d{4}(-\d{2})?$/),
});
export type LeaderboardEntry = z.infer<typeof LeaderboardEntrySchema>;
