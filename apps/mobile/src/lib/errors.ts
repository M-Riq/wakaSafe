import { errorReasonOf, isDomainError } from '@wakasafe/domain';

import { fr } from './i18n';

/** Reason attached to a FORBIDDEN error when an administrator signs in to the client app. */
export const ADMIN_ACCOUNT_REASON = 'ADMIN_ACCOUNT';

/** French message for any error raised by a repository or a business rule. */
export function errorMessage(error: unknown): string {
  if (!isDomainError(error)) return fr.errors.unknown;
  if (error.details?.reason === ADMIN_ACCOUNT_REASON) return fr.errorReasons.ADMIN_ACCOUNT;
  const reason = errorReasonOf(error);
  return reason ? fr.errorReasons[reason] : fr.errors[error.code];
}
