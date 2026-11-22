import { z } from 'zod';

import {
  AccountSanctionSchema,
  AgencySchema,
  AttemptSchema,
  AuthorityProfileSchema,
  DriverSchema,
  IdSchema,
  IsoDateTimeSchema,
  ModerationItemSchema,
  NotificationSchema,
  PointEntrySchema,
  PreferencesSchema,
  ProfileRequestSchema,
  QuestionSchema,
  QuizSchema,
  RatingSchema,
  ReportSchema,
  ReportValidationSchema,
  SafetyContactSchema,
  SupportingDocumentSchema,
  UserSchema,
} from '@wakasafe/domain';

export const MOCK_DATABASE_VERSION = 1;

export const CredentialSchema = z.object({
  userId: IdSchema,
  /** Demo only, see password.ts. */
  passwordHash: z.string().min(1),
});
export type Credential = z.infer<typeof CredentialSchema>;

/** Whole demo dataset, persisted as one JSON document in the local key/value store. */
export const MockDatabaseSchema = z.object({
  version: z.literal(MOCK_DATABASE_VERSION),
  seededAt: IsoDateTimeSchema,
  users: z.array(UserSchema),
  credentials: z.array(CredentialSchema),
  preferences: z.array(PreferencesSchema),
  safetyContacts: z.array(SafetyContactSchema),
  agencies: z.array(AgencySchema),
  profileRequests: z.array(ProfileRequestSchema),
  supportingDocuments: z.array(SupportingDocumentSchema),
  drivers: z.array(DriverSchema),
  authorityProfiles: z.array(AuthorityProfileSchema),
  sanctions: z.array(AccountSanctionSchema),
  reports: z.array(ReportSchema),
  reportValidations: z.array(ReportValidationSchema),
  moderationItems: z.array(ModerationItemSchema),
  quizzes: z.array(QuizSchema),
  questions: z.array(QuestionSchema),
  attempts: z.array(AttemptSchema),
  pointEntries: z.array(PointEntrySchema),
  ratings: z.array(RatingSchema),
  notifications: z.array(NotificationSchema),
});
export type MockDatabase = z.infer<typeof MockDatabaseSchema>;
