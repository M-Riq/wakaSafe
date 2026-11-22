import { useRouter } from 'expo-router';

import { fr } from '@/lib/i18n';
import { AppText, Button, Card, Screen } from '@/ui';

export default function NotFound() {
  const router = useRouter();
  return (
    <Screen>
      <Card>
        <AppText variant="title">{fr.notFound.title}</AppText>
        <AppText tone="muted">{fr.notFound.body}</AppText>
        <Button label={fr.common.home} icon="home-outline" onPress={() => router.replace('/')} />
      </Card>
    </Screen>
  );
}
