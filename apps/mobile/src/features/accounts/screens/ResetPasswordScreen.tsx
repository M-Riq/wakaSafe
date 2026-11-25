import type { PasswordResetRequest } from '@wakasafe/data-contracts';
import {
  BUSINESS_RULES,
  PasswordResetRequestInputSchema,
  ResetPasswordInputSchema,
} from '@wakasafe/domain';
import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';

import { fieldMessage, validateForm, type FormErrors } from '@/lib/forms';
import { format, fr } from '@/lib/i18n';
import { AppText, Banner, Button, Screen, TextField } from '@/ui';

import { FormError } from '../components/FormError';
import { useRequestPasswordReset, useResetPassword } from '../hooks/useSession';

/**
 * F1.2: password reset with a one-time code. In the demo the code is displayed instead of
 * being sent by SMS. Success signs the user in with the new password.
 */
export function ResetPasswordScreen() {
  const params = useLocalSearchParams<{ phone?: string }>();
  const requestCode = useRequestPasswordReset();
  const resetPassword = useResetPassword();
  const [phone, setPhone] = useState(params.phone ?? '');
  const [sent, setSent] = useState<PasswordResetRequest | null>(null);
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function sendCode() {
    const result = validateForm(PasswordResetRequestInputSchema, { phone });
    setErrors(result.errors);
    if (!result.success) return;
    resetPassword.reset();
    requestCode.mutate(result.data.phone, {
      onSuccess: (request) => {
        setSent(request);
        setCode('');
      },
    });
  }

  function submit() {
    const result = validateForm(ResetPasswordInputSchema, { phone, code, newPassword });
    const nextErrors: FormErrors = { ...result.errors };
    if (!nextErrors.newPassword && confirmPassword !== newPassword) {
      nextErrors.confirmPassword = 'PASSWORDS_DO_NOT_MATCH';
    }
    setErrors(nextErrors);
    if (result.success && !nextErrors.confirmPassword) resetPassword.mutate(result.data);
  }

  if (!sent) {
    return (
      <Screen testID="reset-password">
        <AppText tone="muted">{fr.resetPassword.intro}</AppText>
        <TextField
          label={fr.form.phone}
          hint={fr.form.phoneHint}
          value={phone}
          onChangeText={setPhone}
          error={fieldMessage(errors, 'phone')}
          inputMode="tel"
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          onSubmitEditing={sendCode}
          testID="reset-phone"
        />
        <FormError error={requestCode.error} />
        <Button
          label={fr.resetPassword.sendCode}
          icon="chatbox-ellipses-outline"
          loading={requestCode.isPending}
          onPress={sendCode}
          testID="reset-send-code"
        />
      </Screen>
    );
  }

  return (
    <Screen testID="reset-password-code">
      {sent.demoCode ? (
        <Banner
          tone="info"
          icon="key-outline"
          title={format(fr.resetPassword.demoCodeTitle, { code: sent.demoCode })}
          testID="reset-demo-code"
        >
          {fr.resetPassword.demoCode}
        </Banner>
      ) : (
        <Banner tone="info" title={fr.resetPassword.codeSentTitle} testID="reset-code-sent">
          {fr.resetPassword.codeSent}
        </Banner>
      )}
      <TextField
        label={fr.resetPassword.code}
        value={code}
        onChangeText={setCode}
        error={fieldMessage(errors, 'code')}
        inputMode="numeric"
        keyboardType="number-pad"
        autoComplete="one-time-code"
        textContentType="oneTimeCode"
        maxLength={BUSINESS_RULES.accounts.resetCodeLength}
        testID="reset-code"
      />
      <TextField
        label={fr.resetPassword.newPassword}
        hint={fr.form.passwordHint}
        value={newPassword}
        onChangeText={setNewPassword}
        error={fieldMessage(errors, 'newPassword')}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
        testID="reset-new-password"
      />
      <TextField
        label={fr.form.confirmPassword}
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        error={fieldMessage(errors, 'confirmPassword')}
        secure
        autoComplete="new-password"
        textContentType="newPassword"
        onSubmitEditing={submit}
        testID="reset-confirm-password"
      />
      <FormError error={resetPassword.error} testID="reset-error" />
      <Button
        label={fr.resetPassword.submit}
        icon="lock-closed-outline"
        loading={resetPassword.isPending}
        onPress={submit}
        testID="reset-submit"
      />
      <Button
        label={fr.resetPassword.resendCode}
        variant="ghost"
        icon="refresh-outline"
        loading={requestCode.isPending}
        disabled={resetPassword.isPending}
        onPress={sendCode}
        testID="reset-resend"
      />
    </Screen>
  );
}
