import type { z } from 'zod';

import { DOMAIN_ERROR_REASONS, DomainError, isDomainError, type DomainErrorReason } from './errors';

/**
 * Field-level validation codes. Input schemas use them as issue messages, so the client
 * forms and the repositories (mock today, API tomorrow) report the same errors; the UI
 * maps each code to a French message.
 */
export const VALIDATION_CODES = [
  'REQUIRED',
  'INVALID',
  'TEXT_TOO_LONG',
  'PHONE_INVALID',
  'PHONE_TAKEN',
  'PASSWORD_TOO_SHORT',
  'PASSWORD_TOO_LONG',
  'PASSWORD_NEEDS_LETTER',
  'PASSWORD_NEEDS_DIGIT',
  'RESET_CODE_FORMAT',
  'SAFETY_CONTACT_DUPLICATE',
] as const;
export type ValidationCode = (typeof VALIDATION_CODES)[number];

/** First error of each top-level field; `_form` holds errors that belong to no field. */
export type FieldErrors = Partial<Record<string, ValidationCode>>;

function isValidationCode(value: string): value is ValidationCode {
  return (VALIDATION_CODES as readonly string[]).includes(value);
}

export function collectFieldErrors(error: z.ZodError): FieldErrors {
  const fields: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.length > 0 ? String(issue.path[0]) : '_form';
    fields[key] ??= isValidationCode(issue.message) ? issue.message : 'INVALID';
  }
  return fields;
}

/** Parses `input` or throws a VALIDATION_FAILED DomainError carrying the field errors. */
export function validateInput<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new DomainError('VALIDATION_FAILED', 'Invalid input', {
      fields: collectFieldErrors(result.error),
    });
  }
  return result.data;
}

/** Field errors attached to a DomainError (VALIDATION_FAILED or CONFLICT), if any. */
export function fieldErrorsOf(error: unknown): FieldErrors {
  if (!isDomainError(error)) return {};
  const fields = error.details?.fields;
  return fields && typeof fields === 'object' ? (fields as FieldErrors) : {};
}

export function errorReasonOf(error: unknown): DomainErrorReason | null {
  if (!isDomainError(error)) return null;
  const reason = error.details?.reason;
  return typeof reason === 'string' && (DOMAIN_ERROR_REASONS as readonly string[]).includes(reason)
    ? (reason as DomainErrorReason)
    : null;
}
