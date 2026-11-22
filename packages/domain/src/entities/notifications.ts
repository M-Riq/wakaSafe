import { z } from 'zod';

import { IdSchema, IsoDateTimeSchema } from './common';

// M7 notifications (in-app first, FCM later — ADR-0007).

/** `TRIP_ALERT` is only used if the optional M4 module is confirmed (phase 10). */
export const NotificationTypeSchema = z.enum([
  'NEARBY_DANGER',
  'QUIZ_REMINDER',
  'PROFILE_DECISION',
  'AUTHORITY_INFO',
  'ACCOUNT_SANCTION',
  'TRIP_ALERT',
]);
export type NotificationType = z.infer<typeof NotificationTypeSchema>;

export const NotificationSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  type: NotificationTypeSchema,
  title: z.string().min(1),
  body: z.string().min(1),
  /** Optional payload, e.g. { reportId } for a nearby danger. */
  data: z.record(z.string(), z.string()).nullable(),
  createdAt: IsoDateTimeSchema,
  readAt: IsoDateTimeSchema.nullable(),
});
export type Notification = z.infer<typeof NotificationSchema>;
