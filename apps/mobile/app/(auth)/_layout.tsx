import { Stack } from 'expo-router';

import { fr } from '@/lib/i18n';
import { colors, stackHeaderOptions } from '@/ui';

// A direct link (e.g. /login) keeps the welcome screen underneath, so "back" works.
export const unstable_settings = { anchor: 'welcome' };

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        ...stackHeaderOptions,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false, title: fr.common.appName }} />
      <Stack.Screen name="login" options={{ title: fr.login.title }} />
      <Stack.Screen name="register" options={{ title: fr.register.title }} />
      <Stack.Screen name="reset-password" options={{ title: fr.resetPassword.title }} />
      <Stack.Screen name="demo-access" options={{ title: fr.demoAccess.title }} />
    </Stack>
  );
}
