import type { DocumentUpload, RegisterInput } from '@wakasafe/data-contracts';
import {
  ProfileRequestSubmissionSchema,
  RegisterInputSchema,
  REQUIRED_DOCUMENTS,
  type DocumentType,
  type RequestableRole,
} from '@wakasafe/domain';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { fieldMessage, serverFieldErrors, validateForm, type FormErrors } from '@/lib/forms';
import { format, fr } from '@/lib/i18n';
import { AppText, Button, Checkbox, ProgressBar, Screen, spacing, TextField } from '@/ui';

import { DocumentSlot } from '../components/DocumentSlot';
import { FormError } from '../components/FormError';
import { PhotoField } from '../components/PhotoField';
import {
  EMPTY_PROFILE_DRAFT,
  ProfileRequestFields,
  toSubmission,
  type ProfileDraft,
} from '../components/ProfileRequestFields';
import { useRegister } from '../hooks/useSession';

type Step = 'identity' | 'profile' | 'documents';

const ROLES = ['CITIZEN', 'DRIVER', 'AUTHORITY'] as const;

const EMPTY_IDENTITY = {
  firstName: '',
  lastName: '',
  phone: '',
  password: '',
  confirmPassword: '',
  photoUrl: null as string | null,
};

/**
 * F1.1 / F1.3 / F1.4: identity, desired profile, then the supporting documents of a Driver or
 * Authority request (they can also be added later from the profile).
 */
export function RegisterScreen() {
  const router = useRouter();
  const register = useRegister();
  const [step, setStep] = useState<Step>('identity');
  const [identity, setIdentity] = useState(EMPTY_IDENTITY);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [account, setAccount] = useState<RegisterInput | null>(null);
  const [profile, setProfile] = useState<ProfileDraft>(EMPTY_PROFILE_DRAFT);
  const [documents, setDocuments] = useState<Partial<Record<DocumentType, string>>>({});
  const [errors, setErrors] = useState<FormErrors>({});

  const steps: Step[] =
    profile.role === 'CITIZEN' ? ['identity', 'profile'] : ['identity', 'profile', 'documents'];
  const stepIndex = steps.indexOf(step);
  const stepLabel = format(fr.common.stepOf, { current: stepIndex + 1, total: steps.length });
  const phoneTaken = errors.phone === 'PHONE_TAKEN';
  const requestedRole: RequestableRole | null = profile.role === 'CITIZEN' ? null : profile.role;

  function goTo(next: Step) {
    register.reset();
    setStep(next);
  }

  function submitIdentity() {
    const result = validateForm(RegisterInputSchema, identity);
    const nextErrors: FormErrors = { ...result.errors };
    if (!nextErrors.password && identity.confirmPassword !== identity.password) {
      nextErrors.confirmPassword = 'PASSWORDS_DO_NOT_MATCH';
    }
    if (!acceptedTerms) nextErrors.terms = 'TERMS_REQUIRED';
    setErrors(nextErrors);
    if (result.success && Object.keys(nextErrors).length === 0) {
      setAccount(result.data);
      goTo('profile');
    }
  }

  function send(requestedDocuments: DocumentUpload[]) {
    if (!account) return;
    const submission = toSubmission(profile);
    const request = submission ? ProfileRequestSubmissionSchema.parse(submission) : null;
    register.mutate(
      { account, profileRequest: request, documents: requestedDocuments },
      {
        // Account errors (e.g. PHONE_TAKEN) concern the identity fields.
        onError: (error) => {
          const fieldErrors = serverFieldErrors(error);
          if (Object.keys(fieldErrors).length > 0) {
            setErrors(fieldErrors);
            setStep('identity');
          }
        },
      },
    );
  }

  function submitProfile() {
    const submission = toSubmission(profile);
    if (!submission) {
      setErrors({});
      send([]);
      return;
    }
    const result = validateForm(ProfileRequestSubmissionSchema, submission);
    setErrors(result.errors);
    if (result.success) goTo('documents');
  }

  function submitDocuments(role: RequestableRole) {
    send(
      REQUIRED_DOCUMENTS[role].flatMap((type): DocumentUpload[] => {
        const fileUrl = documents[type];
        return fileUrl ? [{ type, fileUrl }] : [];
      }),
    );
  }

  return (
    <Screen key={step} testID={`register-${step}`}>
      <View style={styles.progress}>
        <AppText variant="caption" tone="muted">
          {stepLabel}
        </AppText>
        <AppText variant="title" accessibilityRole="header">
          {fr.register.steps[step]}
        </AppText>
        <ProgressBar value={(stepIndex + 1) / steps.length} accessibilityLabel={stepLabel} />
      </View>

      {step === 'identity' && (
        <>
          <TextField
            label={fr.form.firstName}
            value={identity.firstName}
            onChangeText={(firstName) => setIdentity((prev) => ({ ...prev, firstName }))}
            error={fieldMessage(errors, 'firstName')}
            autoCapitalize="words"
            autoComplete="given-name"
            textContentType="givenName"
            maxLength={60}
            testID="register-first-name"
          />
          <TextField
            label={fr.form.lastName}
            value={identity.lastName}
            onChangeText={(lastName) => setIdentity((prev) => ({ ...prev, lastName }))}
            error={fieldMessage(errors, 'lastName')}
            autoCapitalize="words"
            autoComplete="family-name"
            textContentType="familyName"
            maxLength={60}
            testID="register-last-name"
          />
          <TextField
            label={fr.form.phone}
            hint={fr.form.phoneHint}
            value={identity.phone}
            onChangeText={(phone) => setIdentity((prev) => ({ ...prev, phone }))}
            error={fieldMessage(errors, 'phone')}
            inputMode="tel"
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
            testID="register-phone"
          />
          {phoneTaken && (
            <Button
              label={fr.register.phoneTakenHint}
              variant="ghost"
              icon="log-in-outline"
              onPress={() => router.replace('/login')}
              testID="register-go-login"
            />
          )}
          <TextField
            label={fr.form.password}
            hint={fr.form.passwordHint}
            value={identity.password}
            onChangeText={(password) => setIdentity((prev) => ({ ...prev, password }))}
            error={fieldMessage(errors, 'password')}
            secure
            autoComplete="new-password"
            textContentType="newPassword"
            testID="register-password"
          />
          <TextField
            label={fr.form.confirmPassword}
            value={identity.confirmPassword}
            onChangeText={(confirmPassword) =>
              setIdentity((prev) => ({ ...prev, confirmPassword }))
            }
            error={fieldMessage(errors, 'confirmPassword')}
            secure
            autoComplete="new-password"
            textContentType="newPassword"
            testID="register-confirm-password"
          />
          <PhotoField
            firstName={identity.firstName}
            lastName={identity.lastName}
            photoUrl={identity.photoUrl}
            onChange={(photoUrl) => setIdentity((prev) => ({ ...prev, photoUrl }))}
            hint={format(fr.common.optional, { label: fr.register.photoHint })}
          />
          <Checkbox
            label={fr.register.acceptTerms}
            checked={acceptedTerms}
            onChange={setAcceptedTerms}
            error={fieldMessage(errors, 'terms')}
            testID="register-terms"
          />
          <Button
            label={fr.register.readTerms}
            variant="ghost"
            icon="document-text-outline"
            onPress={() => router.push('/terms')}
            testID="register-read-terms"
          />
          <Button
            label={fr.common.continue}
            icon="arrow-forward-outline"
            onPress={submitIdentity}
            testID="register-continue"
          />
        </>
      )}

      {step === 'profile' && (
        <>
          <AppText tone="muted">{fr.register.profileIntro}</AppText>
          <ProfileRequestFields
            draft={profile}
            onChange={(update) => setProfile((prev) => ({ ...prev, ...update }))}
            errors={errors}
            roles={ROLES}
          />
          <FormError error={register.error} testID="register-error" />
          <Button
            label={requestedRole ? fr.common.continue : fr.register.submit}
            icon={requestedRole ? 'arrow-forward-outline' : 'checkmark-outline'}
            loading={register.isPending}
            onPress={submitProfile}
            testID={requestedRole ? 'register-continue' : 'register-submit'}
          />
          <Button
            label={fr.common.previous}
            variant="ghost"
            icon="arrow-back-outline"
            disabled={register.isPending}
            onPress={() => goTo('identity')}
            testID="register-previous"
          />
        </>
      )}

      {step === 'documents' && requestedRole && (
        <>
          <AppText tone="muted">{fr.register.documentsIntro}</AppText>
          {REQUIRED_DOCUMENTS[requestedRole].map((type) => (
            <DocumentSlot
              key={type}
              type={type}
              fileUrl={documents[type] ?? null}
              providedLabel={fr.documents.added}
              onPicked={(fileUrl) => setDocuments((prev) => ({ ...prev, [type]: fileUrl }))}
              busy={register.isPending}
            />
          ))}
          <FormError error={register.error} testID="register-error" />
          <Button
            label={fr.register.submit}
            icon="checkmark-outline"
            loading={register.isPending}
            onPress={() => submitDocuments(requestedRole)}
            testID="register-submit"
          />
          <Button
            label={fr.common.previous}
            variant="ghost"
            icon="arrow-back-outline"
            disabled={register.isPending}
            onPress={() => goTo('profile')}
            testID="register-previous"
          />
        </>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  progress: { gap: spacing.sm },
});
