import { QueryClientProvider } from '@tanstack/react-query';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';

import { DataProvider } from '@/data';
import { useSessionBootstrap } from '@/features/accounts';
import { fr } from '@/lib/i18n';
import { createQueryClient } from '@/lib/query-client';
import { Button, colors, headerOptions, LoadingView } from '@/ui';

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
      screenOptions={{ ...headerOptions, contentStyle: { backgroundColor: colors.background } }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Protected guard={!signedIn}>
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Protected guard={signedIn}>
        <Stack.Screen name="(app)" options={{ headerShown: false }} />
      </Stack.Protected>
      <Stack.Screen
        name="project-progress"
        options={{
          title: fr.progress.title,
          // Public page shared by URL: without history, offer a way into the app.
          headerRight: ({ canGoBack }) => (canGoBack ? null : <HomeHeaderButton />),
        }}
      />
      <Stack.Screen name="+not-found" options={{ title: fr.notFound.title }} />
    </Stack>
  );
}

function HomeHeaderButton() {
  const router = useRouter();
  return (
    <Button
      testID="header-home"
      variant="ghost"
      icon="home-outline"
      label={fr.common.home}
      onPress={() => router.replace('/')}
    />
  );
}
