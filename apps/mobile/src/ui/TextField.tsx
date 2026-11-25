import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { fr } from '@/lib/i18n';

import { AppText } from './AppText';
import { Icon } from './Icon';
import { colors, radii, sizes, spacing, typography } from './theme';

type NativeInputProps = Pick<
  TextInputProps,
  | 'autoCapitalize'
  | 'autoComplete'
  | 'inputMode'
  | 'keyboardType'
  | 'maxLength'
  | 'onSubmitEditing'
  | 'returnKeyType'
  | 'textContentType'
>;

export interface TextFieldProps extends NativeInputProps {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  /** Already translated message; the field is announced as invalid when set. */
  error?: string;
  hint?: string;
  /** Password field with a show / hide toggle. */
  secure?: boolean;
  editable?: boolean;
  testID?: string;
}

export function TextField({
  label,
  value,
  onChangeText,
  error,
  hint,
  secure = false,
  editable = true,
  testID,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.borderStrong;
  const description = error ?? hint;

  return (
    <View style={styles.field}>
      <AppText variant="label">{label}</AppText>
      <View
        style={[
          styles.inputRow,
          { borderColor, backgroundColor: editable ? colors.surface : colors.surfaceMuted },
        ]}
      >
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          secureTextEntry={secure && !revealed}
          accessibilityLabel={label}
          accessibilityHint={description}
          aria-invalid={error ? true : undefined}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={colors.textSubtle}
          style={[styles.input, { color: editable ? colors.text : colors.textMuted }]}
          {...inputProps}
        />
        {secure && (
          <Pressable
            onPress={() => setRevealed((current) => !current)}
            accessibilityRole="button"
            accessibilityLabel={revealed ? fr.common.hidePassword : fr.common.showPassword}
            hitSlop={spacing.sm}
            style={styles.toggle}
            testID={testID ? `${testID}-toggle` : undefined}
          >
            <Icon name={revealed ? 'eye-off-outline' : 'eye-outline'} color={colors.textMuted} />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.message} accessibilityLiveRegion="polite">
          <Icon name="alert-circle-outline" size={sizes.iconSm} color={colors.danger} />
          <AppText variant="caption" tone="danger" style={styles.messageText}>
            {error}
          </AppText>
        </View>
      ) : (
        hint && (
          <AppText variant="caption" tone="muted">
            {hint}
          </AppText>
        )
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: spacing.xs },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: sizes.touchTarget,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
  },
  input: {
    flex: 1,
    minHeight: sizes.touchTarget - 2 * sizes.borderWidth,
    fontSize: typography.fontSize.md,
    paddingVertical: spacing.sm,
  },
  toggle: { paddingLeft: spacing.sm },
  message: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  messageText: { flex: 1 },
});
