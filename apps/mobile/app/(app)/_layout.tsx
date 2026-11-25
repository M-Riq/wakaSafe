import { Stack } from 'expo-router';

import { useCapabilities, useSessionStore } from '@/features/accounts';
import { fr } from '@/lib/i18n';
import { colors, headerOptions } from '@/ui';

// Deep links (e.g. /driver after a refresh) keep the tabs underneath, so "back" works.
export const unstable_settings = { anchor: '(tabs)' };

/** Signed-in area. Suspended accounts enter in read-only mode (business rules). */
export default function AppLayout() {
  const signedIn = useSessionStore((state) => state.auth !== null);
  // The root guard redirects right after sign-out; render nothing in between.
  return signedIn ? <SignedInNavigator /> : null;
}

function SignedInNavigator() {
  const { canAccessDriverArea } = useCapabilities();
  return (
    <Stack
      screenOptions={{ ...headerOptions, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Protected guard={canAccessDriverArea}>
        <Stack.Screen name="driver" options={{ title: fr.driver.title }} />
      </Stack.Protected>
    </Stack>
  );
}
