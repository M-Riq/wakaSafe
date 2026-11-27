export const DOMAIN_ERROR_CODES = [
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
  /** Password reset code wrong, expired or locked after too many attempts. */
  'INVALID_RESET_CODE',
  'ACCOUNT_SUSPENDED',
  'FORBIDDEN',
  'NOT_FOUND',
  'VALIDATION_FAILED',
  'CONFLICT',
  'QUOTA_EXCEEDED',
  'DAILY_QUIZ_LIMIT_REACHED',
  'ALREADY_VOTED',
  'ALREADY_RATED',
  'NOT_IMPLEMENTED',
] as const;
export type DomainErrorCode = (typeof DOMAIN_ERROR_CODES)[number];

/**
 * Error raised by repositories and business rules. The UI maps `code` to a French
 * message; `message` is technical and in English.
 */
export class DomainError extends Error {
  readonly code: DomainErrorCode;
  readonly details: Readonly<Record<string, unknown>> | undefined;

  constructor(code: DomainErrorCode, message: string, details?: Record<string, unknown>) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
    this.details = details;
  }
}

/**
 * Optional `details.reason` of a DomainError, when the code alone is not precise enough
 * for the user (the UI has a French message for each reason).
 */
export const DOMAIN_ERROR_REASONS = [
  'PHONE_TAKEN',
  'SAFETY_CONTACTS_LIMIT',
  'SAFETY_CONTACT_DUPLICATE',
  'PROFILE_REQUEST_PENDING',
  'PROFILE_REQUEST_CLOSED',
  'PROFILE_ALREADY_GRANTED',
  'NEW_REQUEST_NOT_ALLOWED',
] as const;
export type DomainErrorReason = (typeof DOMAIN_ERROR_REASONS)[number];

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
