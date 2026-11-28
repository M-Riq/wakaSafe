import { z } from 'zod';

import { GeoPointSchema, IdSchema, IsoDateTimeSchema } from './common';

// M2 reports and M3 offline queue.

/** The 10 categories of F2.1. */
export const ReportCategorySchema = z.enum([
  'ACCIDENT_CRITICAL',
  'OBSTACLE',
  'DAMAGED_BRIDGE',
  'DANGEROUS_POTHOLE',
  'SLIPPERY_OR_FLOODED_ROAD',
  'LANDSLIDE',
  'FAULTY_STREET_LIGHTING',
  'TRAFFIC_LIGHT_FAILURE',
  'POORLY_MARKED_ROADWORKS',
  'PERSON_IN_DISTRESS',
]);
export type ReportCategory = z.infer<typeof ReportCategorySchema>;

/** Provisional values, to be validated by GOSAFE (business-rules.md). */
export const SeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']);
export type Severity = z.infer<typeof SeveritySchema>;

/** Provisional values, to be validated by GOSAFE (business-rules.md). */
export const AffectedGroupSchema = z.enum([
  'PEDESTRIANS',
  'MOTORCYCLISTS',
  'CAR_DRIVERS',
  'PUBLIC_TRANSPORT',
  'CHILDREN_STUDENTS',
  'ALL_ROAD_USERS',
]);
export type AffectedGroup = z.infer<typeof AffectedGroupSchema>;

/** Lifecycle: see docs/diagrams/06-states.md (6.2). */
export const ReportStatusSchema = z.enum([
  'CREATED',
  'VALIDATED',
  'INVALIDATED',
  'SUSPICIOUS',
  'HANDLED',
  'CLOSED',
]);
export type ReportStatus = z.infer<typeof ReportStatusSchema>;

export const ReportOriginSchema = z.enum(['ONLINE', 'OFFLINE_SYNCED']);
export type ReportOrigin = z.infer<typeof ReportOriginSchema>;

export const VerdictSchema = z.enum(['CONFIRM', 'REFUTE']);
export type Verdict = z.infer<typeof VerdictSchema>;

export const SyncStateSchema = z.enum(['PENDING_CONFIRMATION', 'SYNCING', 'FAILED']);
export type SyncState = z.infer<typeof SyncStateSchema>;

/** What the user fills in (F2.2). `clientId` makes the offline sync idempotent (F3.2). */
export const ReportDraftSchema = z.object({
  clientId: z.string().min(1),
  category: ReportCategorySchema,
  severity: SeveritySchema,
  affectedGroup: AffectedGroupSchema,
  location: GeoPointSchema,
  city: z.string().min(1),
  photoUrl: z.string().min(1).nullable(),
  occurredAt: IsoDateTimeSchema,
});
export type ReportDraft = z.infer<typeof ReportDraftSchema>;

export const ReportSchema = ReportDraftSchema.extend({
  id: IdSchema,
  authorId: IdSchema,
  createdAt: IsoDateTimeSchema,
  status: ReportStatusSchema,
  origin: ReportOriginSchema,
  confirmations: z.number().int().nonnegative(),
  refutations: z.number().int().nonnegative(),
  /** When the report reached the validation threshold; refutations after it may make it suspicious (F2.5). */
  validatedAt: IsoDateTimeSchema.nullable(),
  handledBy: IdSchema.nullable(),
  handledAt: IsoDateTimeSchema.nullable(),
  closedAt: IsoDateTimeSchema.nullable(),
});
export type Report = z.infer<typeof ReportSchema>;

export const ReportValidationSchema = z.object({
  id: IdSchema,
  reportId: IdSchema,
  userId: IdSchema,
  verdict: VerdictSchema,
  createdAt: IsoDateTimeSchema,
});
export type ReportValidation = z.infer<typeof ReportValidationSchema>;

/** Stored only on the device (M3), never in the database. */
export const PendingReportSchema = z.object({
  localId: z.string().min(1),
  draft: ReportDraftSchema,
  createdAt: IsoDateTimeSchema,
  syncState: SyncStateSchema,
  lastError: z.string().nullable(),
});
export type PendingReport = z.infer<typeof PendingReportSchema>;
