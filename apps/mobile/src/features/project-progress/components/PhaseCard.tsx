import { StyleSheet, View } from 'react-native';

import { format, fr } from '@/lib/i18n';
import {
  AppText,
  Badge,
  Card,
  colors,
  Icon,
  radii,
  sizes,
  spacing,
  typography,
  type BadgeTone,
  type IconName,
} from '@/ui';

import type { Phase, PhaseStatus } from '../roadmap';

export const STATUS_STYLE: Record<PhaseStatus, { tone: BadgeTone; icon: IconName }> = {
  done: { tone: 'success', icon: 'checkmark-circle' },
  in_review: { tone: 'primary', icon: 'eye-outline' },
  in_progress: { tone: 'primary', icon: 'construct-outline' },
  planned: { tone: 'neutral', icon: 'ellipse-outline' },
  optional: { tone: 'warning', icon: 'pause-circle-outline' },
};

export function PhaseCard({ phase, highlighted = false }: { phase: Phase; highlighted?: boolean }) {
  const status = STATUS_STYLE[phase.status];
  return (
    <Card
      testID={`phase-${phase.number}`}
      style={highlighted ? styles.highlighted : undefined}
      accessibilityLabel={`${format(fr.progress.phase, { number: phase.number })} : ${phase.title}, ${fr.progress.status[phase.status]}`}
    >
      <View style={styles.header}>
        <View style={styles.number}>
          <AppText variant="label" tone="primary">
            {phase.number}
          </AppText>
        </View>
        <View style={styles.titles}>
          <AppText variant="heading">{phase.title}</AppText>
          <AppText variant="caption" tone="muted">
            {fr.progress.app[phase.app]}
          </AppText>
        </View>
        <Badge label={fr.progress.status[phase.status]} tone={status.tone} icon={status.icon} />
      </View>
      <AppText tone="muted">{phase.summary}</AppText>
      {phase.requirements.length > 0 && (
        <View style={styles.requirements}>
          <Icon name="document-text-outline" size={sizes.iconSm} color={colors.textSubtle} />
          <AppText variant="caption" tone="subtle">
            {format(fr.progress.requirements, { list: phase.requirements.join(', ') })}
          </AppText>
        </View>
      )}
      <AppText variant="caption" tone="subtle" style={styles.branch}>
        {phase.branch}
      </AppText>
    </Card>
  );
}

const styles = StyleSheet.create({
  highlighted: { borderColor: colors.primary, borderWidth: 2 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  number: {
    width: sizes.iconLg + spacing.xs,
    height: sizes.iconLg + spacing.xs,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  titles: { flex: 1, gap: spacing.xxs },
  requirements: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, flexWrap: 'wrap' },
  branch: { fontFamily: typography.fontFamily.mono },
});
