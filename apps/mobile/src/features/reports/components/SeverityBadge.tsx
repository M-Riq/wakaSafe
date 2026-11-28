import type { Severity } from '@wakasafe/domain';
import { StyleSheet, View } from 'react-native';

import { fr } from '@/lib/i18n';
import { AppText, radii, spacing, typography } from '@/ui';

import { SEVERITY_COLORS } from '../presentation';

/** Solid severity colour (same scale as the map markers), white text. */
export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <View style={[styles.badge, { backgroundColor: SEVERITY_COLORS[severity] }]}>
      <AppText variant="caption" tone="inverse" style={styles.text}>
        {fr.enums.severity[severity]}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  text: { fontWeight: typography.fontWeight.semibold },
});
