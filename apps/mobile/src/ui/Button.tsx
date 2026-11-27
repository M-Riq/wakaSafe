import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, radii, sizes, spacing } from './theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

const VARIANTS: Record<
  Variant,
  { background: string; pressed: string; text: string; border: string }
> = {
  primary: {
    background: colors.primary,
    pressed: colors.primaryPressed,
    text: colors.onPrimary,
    border: colors.primary,
  },
  secondary: {
    background: colors.surface,
    pressed: colors.surfaceMuted,
    text: colors.primary,
    border: colors.borderStrong,
  },
  ghost: {
    background: 'transparent',
    pressed: colors.primarySoft,
    text: colors.primary,
    border: 'transparent',
  },
  danger: {
    background: colors.surface,
    pressed: colors.dangerSoft,
    text: colors.danger,
    border: colors.danger,
  },
};

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  /** Spoken label when it must differ from the visible text. */
  accessibilityLabel?: string;
  accessibilityHint?: string;
  testID?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  icon,
  loading = false,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
  testID,
}: ButtonProps) {
  const palette = VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={inactive}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityHint={accessibilityHint}
      aria-busy={loading}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: pressed ? palette.pressed : palette.background,
          borderColor: palette.border,
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      <View style={styles.content}>
        {loading ? (
          <ActivityIndicator color={palette.text} />
        ) : (
          icon && <Icon name={icon} size={sizes.iconSm + 4} color={palette.text} />
        )}
        <AppText variant="label" style={{ color: palette.text }}>
          {label}
        </AppText>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: sizes.touchTarget,
    borderRadius: radii.md,
    borderWidth: sizes.borderWidth,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
