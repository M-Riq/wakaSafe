import { StyleSheet, View } from 'react-native';

import { fr } from '@/lib/i18n';

import { AppText } from './AppText';
import { Badge } from './Badge';
import { Card } from './Card';
import { Icon, type IconName } from './Icon';
import { Screen } from './Screen';
import { colors, radii, sizes, spacing } from './theme';

interface ComingSoonViewProps {
  icon: IconName;
  title: string;
  description: string;
  testID?: string;
}

/** Placeholder screen of a feature that is not available yet. */
export function ComingSoonView({ icon, title, description, testID }: ComingSoonViewProps) {
  return (
    <Screen testID={testID}>
      <Card style={styles.card}>
        <View style={styles.icon}>
          <Icon name={icon} size={sizes.iconLg + spacing.sm} color={colors.primary} />
        </View>
        <AppText variant="title" style={styles.centered}>
          {title}
        </AppText>
        <AppText tone="muted" style={styles.centered}>
          {description}
        </AppText>
        <View style={styles.badgeRow}>
          <Badge label={fr.common.comingSoon} tone="primary" icon="time-outline" />
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  icon: {
    width: sizes.touchTarget + spacing.xl,
    height: sizes.touchTarget + spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  centered: { textAlign: 'center' },
  badgeRow: { flexDirection: 'row', justifyContent: 'center' },
});
