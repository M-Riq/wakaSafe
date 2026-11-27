import { LoginInputSchema } from '@wakasafe/domain';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { fieldMessage, validateForm, type FormErrors } from '@/lib/forms';
import { fr } from '@/lib/i18n';
import { AppText, Button, Screen, spacing, TextField } from '@/ui';

import { FormError } from '../components/FormError';
import { useSignIn } from '../hooks/useSession';

/** F1.2: sign-in with the phone number and the password. */
export function LoginScreen() {
  const router = useRouter();
  const signIn = useSignIn();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});

  function submit() {
    const result = validateForm(LoginInputSchema, { phone, password });
    setErrors(result.errors);
    if (result.success) signIn.mutate(result.data);
  }

  return (
    <Screen testID="login">
      <AppText tone="muted">{fr.login.intro}</AppText>
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
        returnKeyType="next"
        testID="login-phone"
      />
      <TextField
        label={fr.form.password}
        value={password}
        onChangeText={setPassword}
        error={fieldMessage(errors, 'password')}
        secure
        autoComplete="current-password"
        textContentType="password"
        returnKeyType="go"
        onSubmitEditing={submit}
        testID="login-password"
      />
      <FormError error={signIn.error} testID="login-error" />
      <Button
        label={fr.login.submit}
        icon="log-in-outline"
        loading={signIn.isPending}
        onPress={submit}
        testID="login-submit"
      />
      <Button
        label={fr.login.forgotPassword}
        variant="ghost"
        onPress={() => router.push({ pathname: '/reset-password', params: { phone } })}
        testID="login-forgot-password"
      />
      <View style={styles.register}>
        <AppText tone="muted" style={styles.centered}>
          {fr.login.noAccount}
        </AppText>
        <Button
          label={fr.login.register}
          variant="secondary"
          icon="person-add-outline"
          onPress={() => router.replace('/register')}
          testID="login-register"
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  register: { gap: spacing.sm },
  centered: { textAlign: 'center' },
});
