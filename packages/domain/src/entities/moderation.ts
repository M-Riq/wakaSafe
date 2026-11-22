import { z } from 'zod';

import { IdSchema, IsoDateTimeSchema } from './common';

// F2.5 suspicious reports and F9.3 moderation.

export const ModerationTargetSchema = z.enum(['REPORT', 'ACCOUNT']);
export type ModerationTarget = z.infer<typeof ModerationTargetSchema>;

export const ModerationReasonSchema = z.enum([
  'ABNORMAL_FREQUENCY',
  'MANY_REFUTATIONS',
  'ACTION_LIMIT_ABUSE',
]);
export type ModerationReason = z.infer<typeof ModerationReasonSchema>;

export const ModerationStatusSchema = z.enum(['OPEN', 'RESOLVED']);
export type ModerationStatus = z.infer<typeof ModerationStatusSchema>;

export const ModerationItemSchema = z.object({
  id: IdSchema,
  targetType: ModerationTargetSchema,
  /** Report id or user id depending on `targetType`. */
  targetId: IdSchema,
  reason: ModerationReasonSchema,
  status: ModerationStatusSchema,
  createdAt: IsoDateTimeSchema,
  resolvedBy: IdSchema.nullable(),
  resolvedAt: IsoDateTimeSchema.nullable(),
  decision: z.string().min(1).nullable(),
});
export type ModerationItem = z.infer<typeof ModerationItemSchema>;
