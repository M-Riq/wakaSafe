import { errorMessage } from '@/lib/errors';
import { serverFieldErrors } from '@/lib/forms';
import { fr } from '@/lib/i18n';
import { Banner } from '@/ui';

/**
 * Error returned by a repository call, shown above the form actions. Errors tied to a field
 * (e.g. a phone number already used) are shown next to that field instead.
 */
export function FormError({ error, testID }: { error: unknown; testID?: string }) {
  if (!error || Object.keys(serverFieldErrors(error)).length > 0) return null;
  return (
    <Banner tone="danger" title={fr.common.errorTitle} testID={testID}>
      {errorMessage(error)}
    </Banner>
  );
}
