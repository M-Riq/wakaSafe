import type { Report } from '@wakasafe/domain';
import { Pressable, StyleSheet, View } from 'react-native';

import { format, formatDateTime, fr } from '@/lib/i18n';
import { AppText, Badge, colors, Icon, radii, shadows, sizes, spacing } from '@/ui';

import { CATEGORY_ICONS, SEVERITY_COLORS, STATUS_TONES } from '../presentation';
import { SeverityBadge } from './SeverityBadge';

interface ReportCardProps {
  report: Report;
  onPress: () => void;
  /** Community counters, for the author's own list. */
  showVotes?: boolean;
}

export function ReportCard({ report, onPress, showVotes = false }: ReportCardProps) {
  const category = fr.enums.reportCategory[report.category];
  const when = formatDateTime(report.occurredAt);
  return (
    <Pressable
      testID={`report-card-${report.id}`}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={format(fr.reportMap.openReport, { label: category })}
      accessibilityHint={[
        fr.enums.severity[report.severity],
        fr.enums.reportStatus[report.status],
        report.city,
        when,
      ].join(', ')}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: pressed ? colors.surfaceMuted : colors.surface },
      ]}
    >
      <View style={[styles.icon, { backgroundColor: SEVERITY_COLORS[report.severity] }]}>
        <Icon name={CATEGORY_ICONS[report.category]} color={colors.textInverse} />
      </View>
      <View style={styles.body}>
        <AppText variant="label">{category}</AppText>
        <View style={styles.badges}>
          <SeverityBadge severity={report.severity} />
          <Badge label={fr.enums.reportStatus[report.status]} tone={STATUS_TONES[report.status]} />
        </View>
        <AppText variant="caption" tone="muted">
          {`${report.city} · ${when}`}
        </AppText>
        {showVotes && (
          <View style={styles.votes}>
            <Icon name="thumbs-up-outline" size={sizes.iconSm} color={colors.success} />
            <AppText variant="caption">{report.confirmations}</AppText>
            <Icon name="thumbs-down-outline" size={sizes.iconSm} color={colors.danger} />
            <AppText variant="caption">{report.refutations}</AppText>
          </View>
        )}
      </View>
      <Icon name="chevron-forward" color={colors.textSubtle} />
    </Pressable>
  );
}

const ICON_FRAME = sizes.touchTarget - spacing.xs;

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: sizes.borderWidth,
    borderColor: colors.border,
    borderRadius: radii.lg,
    boxShadow: shadows.card,
  },
  icon: {
    width: ICON_FRAME,
    height: ICON_FRAME,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  votes: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
});
