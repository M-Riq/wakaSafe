import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from './AppText';
import { Icon, type IconName } from './Icon';
import { colors, radii, sizes, spacing } from './theme';

export interface Choice<T extends string> {
  value: T;
  label: string;
  description?: string;
  icon?: IconName;
}

interface ChoiceGroupProps<T extends string> {
  label: string;
  options: readonly Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  error?: string;
  /** Options side by side (short labels) instead of stacked cards. */
  inline?: boolean;
  disabled?: boolean;
  testID?: string;
}

/** Single choice (radio buttons), announced as a radio group on Android and on the web. */
export function ChoiceGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  error,
  inline = false,
  disabled = false,
  testID,
}: ChoiceGroupProps<T>) {
  return (
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel={label}>
      <AppText variant="label">{label}</AppText>
      <View style={inline ? styles.inline : styles.stacked}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              testID={testID ? `${testID}-${option.value}` : undefined}
              onPress={() => onChange(option.value)}
              disabled={disabled}
              accessibilityRole="radio"
              accessibilityLabel={option.label}
              accessibilityHint={option.description}
              aria-checked={selected}
              style={({ pressed }) => [
                styles.option,
                inline && styles.inlineOption,
                {
                  borderColor: selected ? colors.primary : colors.borderStrong,
                  backgroundColor: selected || pressed ? colors.primarySoft : colors.surface,
                  opacity: disabled ? 0.5 : 1,
                },
              ]}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <View style={styles.radioDot} />}
              </View>
              {option.icon && <Icon name={option.icon} color={colors.primary} />}
              <View style={styles.text}>
                <AppText variant="label">{option.label}</AppText>
                {option.description && (
                  <AppText variant="caption" tone="muted">
                    {option.description}
                  </AppText>
                )}
              </View>
            </Pressable>
          );
        })}
      </View>
      {error && (
        <AppText variant="caption" tone="danger" accessibilityLiveRegion="polite">
          {error}
        </AppText>
      )}
    </View>
  );
}

const RADIO_SIZE = sizes.iconMd - spacing.xs;

const styles = StyleSheet.create({
  group: { gap: spacing.sm },
  stacked: { gap: spacing.sm },
  inline: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: sizes.touchTarget,
    padding: spacing.md,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
  },
  inlineOption: { paddingVertical: spacing.sm },
  radio: {
    width: RADIO_SIZE,
    height: RADIO_SIZE,
    borderRadius: radii.pill,
    borderWidth: sizes.borderWidthStrong,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: {
    width: RADIO_SIZE / 2,
    height: RADIO_SIZE / 2,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  text: { flexShrink: 1, gap: spacing.xxs },
});
