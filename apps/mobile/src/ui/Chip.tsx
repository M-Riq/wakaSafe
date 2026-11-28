import { Pressable, StyleSheet } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, radii, sizes, spacing } from './theme';

interface ChipProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  icon?: IconName;
  /** "checkbox" for multiple choices (default), "radio" for a single choice. */
  role?: 'checkbox' | 'radio';
  testID?: string;
}

/** Compact toggle used by filters. */
export function Chip({ label, selected, onPress, icon, role = 'checkbox', testID }: ChipProps) {
  const tint = selected ? colors.onPrimarySoft : colors.text;
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      // Visually compact, but the touch area still reaches the 48 dp minimum.
      hitSlop={spacing.xs}
      accessibilityRole={role}
      accessibilityLabel={label}
      aria-checked={selected}
      style={({ pressed }) => [
        styles.chip,
        {
          borderColor: selected ? colors.primary : colors.borderStrong,
          backgroundColor: selected || pressed ? colors.primarySoft : colors.surface,
        },
      ]}
    >
      <Icon
        name={selected ? 'checkmark' : (icon ?? 'ellipse-outline')}
        size={sizes.iconSm}
        color={tint}
      />
      <AppText variant="label" style={{ color: tint }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: sizes.touchTarget - spacing.sm,
    paddingHorizontal: spacing.md,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.pill,
  },
});
