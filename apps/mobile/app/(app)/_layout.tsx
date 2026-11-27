import { Stack } from 'expo-router';

import { useCapabilities, useSessionStore } from '@/features/accounts';
import { fr } from '@/lib/i18n';
import { colors, stackHeaderOptions } from '@/ui';

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
      screenOptions={{
        ...stackHeaderOptions,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="profile/edit" options={{ title: fr.editProfile.title }} />
      <Stack.Screen name="profile/preferences" options={{ title: fr.preferences.title }} />
      <Stack.Screen name="profile/safety-contacts" options={{ title: fr.safetyContacts.title }} />
      <Stack.Screen name="profile/request" options={{ title: fr.profileRequest.title }} />
      <Stack.Screen name="profile/documents" options={{ title: fr.documents.title }} />
      <Stack.Protected guard={canAccessDriverArea}>
        <Stack.Screen name="driver" options={{ title: fr.driver.title }} />
      </Stack.Protected>
    </Stack>
  );
}
