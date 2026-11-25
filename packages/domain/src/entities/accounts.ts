import { z } from 'zod';

import { PhoneSchema } from '../phone';
import { IdSchema, IsoDateTimeSchema } from './common';

// M1 — accounts and profiles (see docs/diagrams/04-domain-classes.md).

export const RoleSchema = z.enum(['CITIZEN', 'DRIVER', 'AUTHORITY', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

/** Roles that require a manual validation by an administrator (F1.3). */
export const RequestableRoleSchema = z.enum(['DRIVER', 'AUTHORITY']);
export type RequestableRole = z.infer<typeof RequestableRoleSchema>;

/** Account status is independent from profile requests (ADR-0009). */
export const AccountStatusSchema = z.enum(['ACTIVE', 'SUSPENDED']);
export type AccountStatus = z.infer<typeof AccountStatusSchema>;

export const ProfileRequestStatusSchema = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type ProfileRequestStatus = z.infer<typeof ProfileRequestStatusSchema>;

export const DocumentTypeSchema = z.enum(['ID_CARD', 'DRIVING_LICENSE', 'FUNCTION_PROOF']);
export type DocumentType = z.infer<typeof DocumentTypeSchema>;

const NameSchema = z.string().trim().min(1).max(60);

export const UserSchema = z.object({
  id: IdSchema,
  firstName: NameSchema,
  lastName: NameSchema,
  phone: PhoneSchema,
  photoUrl: z.string().min(1).nullable(),
  role: RoleSchema,
  status: AccountStatusSchema,
  suspendedUntil: IsoDateTimeSchema.nullable(),
  createdAt: IsoDateTimeSchema,
});
export type User = z.infer<typeof UserSchema>;

export const PreferencesSchema = z.object({
  userId: IdSchema,
  nearbyDangerAlerts: z.boolean(),
  nearbyRadiusKm: z.number().int().min(1).max(50),
  quizReminders: z.boolean(),
  language: z.literal('fr'),
});
export type Preferences = z.infer<typeof PreferencesSchema>;

export const SafetyContactSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  name: z.string().trim().min(1).max(80),
  phone: PhoneSchema,
  relation: z.string().trim().min(1).max(40).nullable(),
});
export type SafetyContact = z.infer<typeof SafetyContactSchema>;

export const AgencySchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  city: z.string().min(1),
});
export type Agency = z.infer<typeof AgencySchema>;

export const ProfileRequestSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  requestedRole: RequestableRoleSchema,
  status: ProfileRequestStatusSchema,
  /** Driver requests only. */
  agencyId: IdSchema.nullable(),
  /** Authority requests only. */
  organization: z.string().min(1).nullable(),
  position: z.string().min(1).nullable(),
  submittedAt: IsoDateTimeSchema,
  reviewedAt: IsoDateTimeSchema.nullable(),
  reviewedBy: IdSchema.nullable(),
  rejectionReason: z.string().min(1).nullable(),
});
export type ProfileRequest = z.infer<typeof ProfileRequestSchema>;

export const SupportingDocumentSchema = z.object({
  id: IdSchema,
  profileRequestId: IdSchema,
  type: DocumentTypeSchema,
  fileUrl: z.string().min(1),
  uploadedAt: IsoDateTimeSchema,
});
export type SupportingDocument = z.infer<typeof SupportingDocumentSchema>;

/** Documents required per requested role (F1.4). */
export const REQUIRED_DOCUMENTS: Readonly<Record<RequestableRole, readonly DocumentType[]>> = {
  DRIVER: ['ID_CARD', 'DRIVING_LICENSE'],
  AUTHORITY: ['ID_CARD', 'FUNCTION_PROOF'],
};

export const DriverSchema = z.object({
  userId: IdSchema,
  agencyId: IdSchema,
  validatedAt: IsoDateTimeSchema,
});
export type Driver = z.infer<typeof DriverSchema>;

export const AuthorityProfileSchema = z.object({
  userId: IdSchema,
  organization: z.string().min(1),
  position: z.string().min(1),
  validatedAt: IsoDateTimeSchema,
});
export type AuthorityProfile = z.infer<typeof AuthorityProfileSchema>;

export const AccountSanctionSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  reason: z.string().min(1),
  startsAt: IsoDateTimeSchema,
  /** null = until manual reactivation. */
  endsAt: IsoDateTimeSchema.nullable(),
  /** null = automatic sanction (F2.6). */
  createdBy: IdSchema.nullable(),
});
export type AccountSanction = z.infer<typeof AccountSanctionSchema>;

/** Authenticated session returned by the AuthRepository (simulated in the demo). */
export const SessionSchema = z.object({
  token: z.string().min(1),
  userId: IdSchema,
  role: RoleSchema,
  startedAt: IsoDateTimeSchema,
});
export type Session = z.infer<typeof SessionSchema>;
