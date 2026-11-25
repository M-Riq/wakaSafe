import { REQUIRED_DOCUMENTS, type ProfileRequest } from '@wakasafe/domain';

import { format, formatDate, fr } from '@/lib/i18n';
import { AppText, Banner, ErrorView, LoadingView, Screen } from '@/ui';

import { DocumentSlot } from '../components/DocumentSlot';
import { FormError } from '../components/FormError';
import { useUploadDocument } from '../hooks/useAccountMutations';
import {
  useCapabilities,
  useLatestProfileRequest,
  useProfileDocuments,
} from '../hooks/useProfileData';
import { useCurrentUser } from '../hooks/useSession';

/** F1.4: supporting documents of the latest profile request, editable while it is pending. */
export function DocumentsScreen() {
  const user = useCurrentUser();
  const request = useLatestProfileRequest(user.id);
  if (request.isPending) return <LoadingView />;
  if (request.isError) {
    return (
      <Screen>
        <ErrorView error={request.error} onRetry={() => void request.refetch()} />
      </Screen>
    );
  }
  if (!request.data) {
    return (
      <Screen testID="documents">
        <Banner tone="info" title={fr.documents.noRequest} />
      </Screen>
    );
  }
  return <RequestDocuments request={request.data} />;
}

function RequestDocuments({ request }: { request: ProfileRequest }) {
  const { isReadOnly } = useCapabilities();
  const documents = useProfileDocuments(request.id);
  const upload = useUploadDocument(request.id);

  if (documents.isPending) return <LoadingView />;
  if (documents.isError) {
    return (
      <Screen>
        <ErrorView error={documents.error} onRetry={() => void documents.refetch()} />
      </Screen>
    );
  }

  const closed = request.status !== 'PENDING';
  const editable = !closed && !isReadOnly;

  return (
    <Screen testID="documents">
      <AppText variant="heading">
        {format(fr.documents.forRequest, { role: fr.enums.role[request.requestedRole] })}
      </AppText>
      {closed && <Banner tone="info" title={fr.documents.closed} testID="documents-closed" />}
      {!closed && isReadOnly && (
        <Banner tone="danger" title={fr.documents.readOnly} testID="documents-read-only" />
      )}
      {editable && <AppText tone="muted">{fr.documents.intro}</AppText>}
      {REQUIRED_DOCUMENTS[request.requestedRole].map((type) => {
        const document = documents.data.find((item) => item.type === type);
        return (
          <DocumentSlot
            key={type}
            type={type}
            fileUrl={document?.fileUrl ?? null}
            providedLabel={
              document
                ? format(fr.documents.provided, { date: formatDate(document.uploadedAt) })
                : fr.documents.added
            }
            readOnly={!editable}
            busy={upload.isPending}
            onPicked={(fileUrl) => upload.mutate({ type, fileUrl })}
          />
        );
      })}
      <FormError error={upload.error} testID="documents-error" />
    </Screen>
  );
}
