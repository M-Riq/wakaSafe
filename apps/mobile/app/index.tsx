import { Redirect } from 'expo-router';

import { useSessionStore } from '@/features/accounts';

export default function Index() {
  const signedIn = useSessionStore((state) => state.status === 'signedIn');
  return <Redirect href={signedIn ? '/map' : '/welcome'} />;
}
