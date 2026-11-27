import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { DataProvider } from '@/data';
import { useSessionBootstrap } from '@/features/accounts';
import { fr } from '@/lib/i18n';
import { createQueryClient } from '@/lib/query-client';
import { colors, LoadingView, stackHeaderOptions } from '@/ui';

export default function RootLayout() {
  const [queryClient] = useState(createQueryClient);
  return (
    <DataProvider>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="dark" />
        <RootNavigator />
      </QueryClientProvider>
    </DataProvider>
  );
}

function RootNavigator() {
  const status = useSessionBootstrap();
  if (status === 'loading') return <LoadingView />;
  const signedIn = status === 'signedIn';

  return (
    <Stack
      screenOptions={{
        ...stackHeaderOptions,
        contentStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
      {/* Readable before and after sign-in (link from the registration form). */}
      <Stack.Screen name="terms" options={{ title: fr.terms.title }} />
      <Stack.Screen name="+not-found" options={{ title: fr.notFound.title }} />
    </Stack>
  );
}
