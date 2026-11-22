import { formatCameroonPhone } from '@wakasafe/domain';
import { StyleSheet, View } from 'react-native';

import { useDemoTools, type DemoAccountInfo } from '@/data';
import { errorMessage } from '@/lib/errors';
import { format, fr } from '@/lib/i18n';
import { AppText, Badge, Banner, Button, Card, Screen, spacing, type BadgeTone } from '@/ui';

import { useSignIn } from '../hooks/useSession';

const ROLE_TONE: Record<DemoAccountInfo['role'], BadgeTone> = {
  CITIZEN: 'neutral',
  DRIVER: 'primary',
  AUTHORITY: 'success',
  ADMIN: 'warning',
};

/**
 * Temporary demo entry point (phase 1): one-tap sign-in with the demo accounts.
 * The phone + password form (F1.2) replaces it as the main entry in phase 2.
 */
export function DemoAccessScreen() {
  const demo = useDemoTools();
  const signIn = useSignIn();
  const pendingPhone = signIn.isPending ? signIn.variables.phone : undefined;

  return (
    <Screen testID="demo-access">
      <View style={styles.header}>
        <AppText variant="title">{fr.demoAccess.title}</AppText>
        <AppText tone="muted">{fr.demoAccess.intro}</AppText>
      </View>
      {signIn.isError && (
        <Banner tone="danger" title={fr.common.errorTitle}>
          {errorMessage(signIn.error)}
        </Banner>
      )}
      {demo?.accounts.map((account) => (
        <Card key={account.userId} testID={`demo-account-${account.userId}`}>
          <View style={styles.titleRow}>
            <AppText variant="heading" style={styles.title}>
              {account.label}
            </AppText>
            <Badge label={fr.enums.role[account.role]} tone={ROLE_TONE[account.role]} />
          </View>
          <AppText tone="muted">{account.description}</AppText>
          <AppText variant="caption" tone="subtle">
            {format(fr.demoAccess.credentials, {
              phone: formatCameroonPhone(account.phone),
              password: demo.password,
            })}
          </AppText>
          <Button
            label={format(fr.demoAccess.signIn, { label: account.label })}
            icon="log-in-outline"
            loading={pendingPhone === account.phone}
            disabled={signIn.isPending}
            onPress={() => signIn.mutate({ phone: account.phone, password: demo.password })}
            testID={`demo-sign-in-${account.userId}`}
          />
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  title: { flexShrink: 1 },
});
