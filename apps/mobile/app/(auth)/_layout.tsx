import { Stack } from 'expo-router';

import { fr } from '@/lib/i18n';
import { colors, headerOptions } from '@/ui';

// A direct link to /demo-access keeps the welcome screen underneath, so "back" works.
export const unstable_settings = { anchor: 'welcome' };

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{ ...headerOptions, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="welcome" options={{ headerShown: false, title: fr.common.appName }} />
      <Stack.Screen name="demo-access" options={{ title: fr.demoAccess.title }} />
    </Stack>
  );
}
