import { ProfileRequestSubmissionSchema } from '@wakasafe/domain';
import { useRouter } from 'expo-router';
import { useState } from 'react';

import { validateForm, type FormErrors } from '@/lib/forms';
import { fr } from '@/lib/i18n';
import { AppText, Banner, Button, LoadingView, Screen } from '@/ui';

import { FormError } from '../components/FormError';
import {
  ProfileRequestFields,
  toSubmission,
  type ProfileDraft,
} from '../components/ProfileRequestFields';
import { useSubmitProfileRequest } from '../hooks/useAccountMutations';
import { useCapabilities, useLatestProfileRequest } from '../hooks/useProfileData';
import { useCurrentUser } from '../hooks/useSession';

const REQUESTABLE_ROLES = ['DRIVER', 'AUTHORITY'] as const;

/** F1.3: a Citizen asks for the Driver or Authority profile, then adds the documents (F1.4). */
export function ProfileRequestScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const latestRequest = useLatestProfileRequest(user.id);
  const { canRequestProfile } = useCapabilities();
  const submitRequest = useSubmitProfileRequest();
  const [draft, setDraft] = useState<ProfileDraft>({
    role: 'DRIVER',
    agencyId: null,
    organization: '',
    position: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});

  // After a successful submission the request is pending: the screen is about to be replaced.
  if (latestRequest.isPending || submitRequest.isSuccess) return <LoadingView />;

  if (!canRequestProfile) {
    return (
      <Screen testID="profile-request">
        <Banner
          tone="info"
          title={fr.profileRequest.unavailable}
          testID="profile-request-unavailable"
        />
      </Screen>
    );
  }

  function submit() {
    const result = validateForm(ProfileRequestSubmissionSchema, toSubmission(draft));
    setErrors(result.errors);
    if (!result.success) return;
    submitRequest.mutate(result.data, {
      onSuccess: () => router.replace('/profile/documents'),
    });
  }

  return (
    <Screen testID="profile-request">
      <AppText tone="muted">{fr.profileRequest.intro}</AppText>
      <ProfileRequestFields
        draft={draft}
        onChange={(update) => {
          submitRequest.reset();
          setDraft((prev) => ({ ...prev, ...update }));
        }}
        errors={errors}
        roles={REQUESTABLE_ROLES}
      />
      <FormError error={submitRequest.error} testID="profile-request-error" />
      <Button
        label={fr.profileRequest.submit}
        icon="send-outline"
        loading={submitRequest.isPending}
        onPress={submit}
        testID="profile-request-submit"
      />
    </Screen>
  );
}
