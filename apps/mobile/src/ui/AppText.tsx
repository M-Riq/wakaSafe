import { Platform, Text, type TextProps, type TextStyle } from 'react-native';

import { colors, typography } from './theme';

type Variant = 'display' | 'title' | 'heading' | 'body' | 'label' | 'caption';
type Tone = 'default' | 'muted' | 'subtle' | 'inverse' | 'primary' | 'danger' | 'success';

const VARIANTS: Record<Variant, TextStyle> = {
  display: {
    fontSize: typography.fontSize['3xl'],
    lineHeight: typography.lineHeight['3xl'],
    fontWeight: typography.fontWeight.bold,
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    lineHeight: typography.lineHeight['2xl'],
    fontWeight: typography.fontWeight.bold,
  },
  heading: {
    fontSize: typography.fontSize.lg,
    lineHeight: typography.lineHeight.lg,
    fontWeight: typography.fontWeight.semibold,
  },
  body: {
    fontSize: typography.fontSize.md,
    lineHeight: typography.lineHeight.md,
    fontWeight: typography.fontWeight.regular,
  },
  label: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.semibold,
  },
  caption: {
    fontSize: typography.fontSize.sm,
    lineHeight: typography.lineHeight.sm,
    fontWeight: typography.fontWeight.regular,
  },
};

const TONES: Record<Tone, string> = {
  default: colors.text,
  muted: colors.textMuted,
  subtle: colors.textSubtle,
  inverse: colors.textInverse,
  primary: colors.primary,
  danger: colors.danger,
  success: colors.success,
};

export interface AppTextProps extends TextProps {
  variant?: Variant;
  tone?: Tone;
}

const HEADING_LEVELS: Partial<Record<Variant, number>> = { display: 1, title: 2, heading: 3 };

export function AppText({ variant = 'body', tone = 'default', style, ...props }: AppTextProps) {
  const level = HEADING_LEVELS[variant];
  // react-native-web turns aria-level into <h1>-<h3>; React Native ignores it.
  const webHeading: Record<string, unknown> =
    level !== undefined && Platform.OS === 'web' ? { 'aria-level': level } : {};
  return (
    <Text
      accessibilityRole={level !== undefined ? 'header' : undefined}
      {...webHeading}
      {...props}
      style={[VARIANTS[variant], { color: TONES[tone] }, style]}
    />
  );
}
