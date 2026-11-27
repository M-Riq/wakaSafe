import { Redirect } from 'expo-router';

import { useSessionStore } from '@/features/accounts';

export default function Index() {
  const signedIn = useSessionStore((state) => state.status === 'signedIn');
  const landing = useSessionStore((state) => state.landing);
  return <Redirect href={signedIn ? (landing ?? '/map') : '/welcome'} />;
}
