import { formatCameroonPhone, ProfileUpdateSchema } from '@wakasafe/domain';
import { useState } from 'react';

import { fieldMessage, serverFieldErrors, validateForm, type FormErrors } from '@/lib/forms';
import { fr } from '@/lib/i18n';
import { Banner, Button, Screen, TextField } from '@/ui';

import { FormError } from '../components/FormError';
import { PhotoField } from '../components/PhotoField';
import { useUpdateProfile } from '../hooks/useAccountMutations';
import { useCurrentUser } from '../hooks/useSession';

/** F1.5: name and photo. The phone number identifies the account and stays read-only. */
export function EditProfileScreen() {
  const user = useCurrentUser();
  const updateProfile = useUpdateProfile();
  const [draft, setDraft] = useState({
    firstName: user.firstName,
    lastName: user.lastName,
    photoUrl: user.photoUrl,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  function change(update: Partial<typeof draft>) {
    updateProfile.reset();
    setDraft((prev) => ({ ...prev, ...update }));
  }

  function save() {
    const result = validateForm(ProfileUpdateSchema, draft);
    setErrors(result.errors);
    if (!result.success) return;
    updateProfile.mutate(result.data, {
      onError: (error) => setErrors(serverFieldErrors(error)),
    });
  }

  return (
    <Screen testID="edit-profile">
      <PhotoField
        firstName={draft.firstName}
        lastName={draft.lastName}
        photoUrl={draft.photoUrl}
        onChange={(photoUrl) => change({ photoUrl })}
      />
      <TextField
        label={fr.form.firstName}
        value={draft.firstName}
        onChangeText={(firstName) => change({ firstName })}
        error={fieldMessage(errors, 'firstName')}
        autoCapitalize="words"
        autoComplete="given-name"
        maxLength={60}
        testID="edit-first-name"
      />
      <TextField
        label={fr.form.lastName}
        value={draft.lastName}
        onChangeText={(lastName) => change({ lastName })}
        error={fieldMessage(errors, 'lastName')}
        autoCapitalize="words"
        autoComplete="family-name"
        maxLength={60}
        testID="edit-last-name"
      />
      <TextField
        label={fr.form.phone}
        value={formatCameroonPhone(user.phone)}
        onChangeText={() => undefined}
        hint={fr.editProfile.phoneLocked}
        editable={false}
        testID="edit-phone"
      />
      <FormError error={updateProfile.error} />
      {updateProfile.isSuccess && (
        <Banner tone="success" title={fr.common.saved} testID="edit-profile-saved" />
      )}
      <Button
        label={fr.common.save}
        icon="checkmark-outline"
        loading={updateProfile.isPending}
        onPress={save}
        testID="edit-profile-save"
      />
    </Screen>
  );
}
