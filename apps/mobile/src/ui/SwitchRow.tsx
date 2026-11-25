import { Platform, StyleSheet, Switch, View } from 'react-native';

import { AppText } from './AppText';
import { colors, sizes, spacing } from './theme';

interface SwitchRowProps {
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  testID?: string;
}

// react-native-web colours the active thumb and track with its own defaults unless told otherwise.
const WEB_ACTIVE_COLORS: Record<string, unknown> =
  Platform.OS === 'web'
    ? { activeThumbColor: colors.surface, activeTrackColor: colors.primary }
    : {};

export function SwitchRow({ label, hint, value, onValueChange, disabled, testID }: SwitchRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText variant="label">{label}</AppText>
        {hint && (
          <AppText variant="caption" tone="muted">
            {hint}
          </AppText>
        )}
      </View>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
        accessibilityHint={hint}
        trackColor={{ false: colors.borderStrong, true: colors.primary }}
        thumbColor={colors.surface}
        {...WEB_ACTIVE_COLORS}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
  },
  text: { flex: 1, gap: spacing.xxs },
});
