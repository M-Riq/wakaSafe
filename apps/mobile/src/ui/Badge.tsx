import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, radii, sizes, spacing, typography } from './theme';

export type BadgeTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

const TONES: Record<BadgeTone, { background: string; text: string }> = {
  neutral: { background: colors.surfaceMuted, text: colors.textMuted },
  primary: { background: colors.primarySoft, text: colors.onPrimarySoft },
  success: { background: colors.successSoft, text: colors.onSuccessSoft },
  warning: { background: colors.warningSoft, text: colors.onWarningSoft },
  danger: { background: colors.dangerSoft, text: colors.onDangerSoft },
};

interface BadgeProps {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
}

export function Badge({ label, tone = 'neutral', icon }: BadgeProps) {
  const palette = TONES[tone];
  return (
    <View style={[styles.badge, { backgroundColor: palette.background }]}>
      {icon && <Icon name={icon} size={sizes.iconSm - 2} color={palette.text} />}
      <AppText variant="label" style={[styles.text, { color: palette.text }]}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xxs,
  },
  text: { fontSize: typography.fontSize.xs, lineHeight: typography.lineHeight.xs },
});
