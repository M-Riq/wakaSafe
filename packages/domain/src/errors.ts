export const DOMAIN_ERROR_CODES = [
  'UNAUTHENTICATED',
  'INVALID_CREDENTIALS',
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

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof DomainError;
}
