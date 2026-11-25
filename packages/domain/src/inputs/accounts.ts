import { z } from 'zod';

import { BUSINESS_RULES } from '../config/business-rules';
import { IdSchema } from '../entities/common';
import { DocumentTypeSchema, PersonNameSchema, RequestableRoleSchema } from '../entities/accounts';
import { normalizeCameroonPhone } from '../phone';

// M1 inputs, shared by the client forms and the repository implementations.
// Issue messages are validation codes (see validation.ts), never user-facing text.

const { passwordMinLength, resetCodeLength } = BUSINESS_RULES.accounts;

/** Technical upper bound (bcrypt-compatible), not a business rule. */
export const PASSWORD_MAX_LENGTH = 72;

/** Free user input ("6 00 00 00 01", "+237…"), normalised to E.164. */
export const PhoneInputSchema = z.string().transform((value, ctx) => {
  if (value.trim() === '') {
    ctx.addIssue({ code: 'custom', message: 'REQUIRED' });
    return z.NEVER;
  }
  const phone = normalizeCameroonPhone(value);
  if (!phone) {
    ctx.addIssue({ code: 'custom', message: 'PHONE_INVALID' });
    return z.NEVER;
  }
  return phone;
});

/** F1.1, F1.2 — provisional policy (business-rules.md). */
export const PasswordSchema = z
  .string()
  .min(1, 'REQUIRED')
  .min(passwordMinLength, 'PASSWORD_TOO_SHORT')
  .max(PASSWORD_MAX_LENGTH, 'PASSWORD_TOO_LONG')
  .regex(/\p{L}/u, 'PASSWORD_NEEDS_LETTER')
  .regex(/\d/, 'PASSWORD_NEEDS_DIGIT');

/** Locally compressed image (data URI) or uploaded file URL. */
const ImageUrlSchema = z.string().min(1, 'REQUIRED');

/** Optional free text: blank becomes null. */
function optionalText(max: number) {
  return z
    .string()
    .trim()
    .max(max, 'TEXT_TOO_LONG')
    .nullable()
    .transform((value) => (value ? value : null));
}

/** F1.1 — every new account starts as an active Citizen (F1.3). */
export const RegisterInputSchema = z.object({
  firstName: PersonNameSchema,
  lastName: PersonNameSchema,
  phone: PhoneInputSchema,
  password: PasswordSchema,
  photoUrl: ImageUrlSchema.nullable(),
});

/** F1.2 — the password policy is not re-checked at sign-in (older passwords stay valid). */
export const LoginInputSchema = z.object({
  phone: PhoneInputSchema,
  password: z.string().min(1, 'REQUIRED'),
});

export const PasswordResetRequestInputSchema = z.object({ phone: PhoneInputSchema });

export const ResetCodeSchema = z
  .string()
  .trim()
  .min(1, 'REQUIRED')
  .regex(new RegExp(`^\\d{${resetCodeLength}}$`), 'RESET_CODE_FORMAT');

export const ResetPasswordInputSchema = z.object({
  phone: PhoneInputSchema,
  code: ResetCodeSchema,
  newPassword: PasswordSchema,
});

/** F1.5 — the phone number identifies the account and cannot be changed. */
export const ProfileUpdateSchema = z
  .object({
    firstName: PersonNameSchema,
    lastName: PersonNameSchema,
    photoUrl: ImageUrlSchema.nullable(),
  })
  .partial();

export const PreferencesUpdateSchema = z
  .object({
    nearbyDangerAlerts: z.boolean(),
    nearbyRadiusKm: z.number().int().min(1).max(50),
    quizReminders: z.boolean(),
    language: z.literal('fr'),
  })
  .partial();

export const SafetyContactInputSchema = z.object({
  id: IdSchema.optional(),
  name: z.string().trim().min(1, 'REQUIRED').max(80, 'TEXT_TOO_LONG'),
  phone: PhoneInputSchema,
  relation: optionalText(40),
});

/**
 * F1.3 — a Driver request names the affiliated agency, an Authority request the
 * organisation and the position. Fields of the other role are cleared.
 */
export const ProfileRequestSubmissionSchema = z
  .object({
    requestedRole: RequestableRoleSchema,
    agencyId: IdSchema.nullable(),
    organization: optionalText(80),
    position: optionalText(80),
  })
  .superRefine((value, ctx) => {
    const missing = (field: 'agencyId' | 'organization' | 'position') =>
      ctx.addIssue({ code: 'custom', message: 'REQUIRED', path: [field] });
    if (value.requestedRole === 'DRIVER' && !value.agencyId) missing('agencyId');
    if (value.requestedRole === 'AUTHORITY') {
      if (!value.organization) missing('organization');
      if (!value.position) missing('position');
    }
  })
  .transform((value) =>
    value.requestedRole === 'DRIVER'
      ? { ...value, organization: null, position: null }
      : { ...value, agencyId: null },
  );

export const DocumentUploadSchema = z.object({
  type: DocumentTypeSchema,
  fileUrl: ImageUrlSchema,
});
