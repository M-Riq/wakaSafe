import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { colors, radii, sizes, spacing } from './theme';

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  testID?: string;
}

export function Checkbox({ label, checked, onChange, error, testID }: CheckboxProps) {
  return (
    <View style={styles.wrapper}>
      <Pressable
        testID={testID}
        onPress={() => onChange(!checked)}
        accessibilityRole="checkbox"
        accessibilityLabel={label}
        accessibilityHint={error}
        aria-checked={checked}
        style={styles.row}
      >
        <View
          style={[
            styles.box,
            {
              borderColor: error ? colors.danger : checked ? colors.primary : colors.borderStrong,
              backgroundColor: checked ? colors.primary : colors.surface,
            },
          ]}
        >
          {checked && <Icon name="checkmark" size={sizes.iconSm} color={colors.onPrimary} />}
        </View>
        <AppText style={styles.label}>{label}</AppText>
      </Pressable>
      {error && (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

const BOX_SIZE = sizes.iconMd;

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
  },
  box: {
    width: BOX_SIZE,
    height: BOX_SIZE,
    borderRadius: radii.sm,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { flex: 1 },
});
