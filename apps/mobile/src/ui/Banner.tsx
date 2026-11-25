import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, radii, sizes, spacing } from './theme';

type Tone = 'info' | 'success' | 'warning' | 'danger';

const TONES: Record<Tone, { background: string; border: string; text: string; icon: IconName }> = {
  info: {
    background: colors.primarySoft,
    border: colors.primary,
    text: colors.onPrimarySoft,
    icon: 'information-circle-outline',
  },
  success: {
    background: colors.successSoft,
    border: colors.success,
    text: colors.onSuccessSoft,
    icon: 'checkmark-circle-outline',
  },
  warning: {
    background: colors.warningSoft,
    border: colors.warning,
    text: colors.onWarningSoft,
    icon: 'time-outline',
  },
  danger: {
    background: colors.dangerSoft,
    border: colors.danger,
    text: colors.onDangerSoft,
    icon: 'alert-circle-outline',
  },
};

interface BannerProps {
  tone?: Tone;
  title: string;
  children?: ReactNode;
  icon?: IconName;
  testID?: string;
}

/** Inline message (status, warning, error). Announced by screen readers on web and Android. */
export function Banner({ tone = 'info', title, children, icon, testID }: BannerProps) {
  const palette = TONES[tone];
  return (
    <View
      testID={testID}
      accessibilityRole={tone === 'danger' ? 'alert' : 'summary'}
      accessibilityLiveRegion="polite"
      style={[styles.banner, { backgroundColor: palette.background, borderColor: palette.border }]}
    >
      <Icon name={icon ?? palette.icon} color={palette.text} />
      <View style={styles.content}>
        <AppText variant="label" style={{ color: palette.text }}>
          {title}
        </AppText>
        {typeof children === 'string' ? (
          <AppText variant="caption" style={{ color: palette.text }}>
            {children}
          </AppText>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.md,
    borderWidth: sizes.borderWidth,
    borderLeftWidth: spacing.xs,
  },
  content: { flex: 1, gap: spacing.xs },
});
