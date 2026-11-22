import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { errorMessage } from '@/lib/errors';
import { fr } from '@/lib/i18n';

import { Banner } from './Banner';
import { Button } from './Button';
import { colors, spacing } from './theme';

export function LoadingView({ label = fr.common.loading }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLabel={label} accessibilityRole="progressbar">
      <ActivityIndicator size="large" color={colors.primary} />
    </View>
  );
}

export function ErrorView({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  return (
    <View style={styles.error}>
      <Banner tone="danger" title={fr.common.errorTitle}>
        {errorMessage(error)}
      </Banner>
      {onRetry && <Button label={fr.common.retry} variant="secondary" onPress={onRetry} />}
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  error: { gap: spacing.md },
});
