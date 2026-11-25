import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors, radii, shadows, sizes, spacing } from './theme';

export function Card({ style, ...props }: ViewProps) {
  return <View {...props} style={[styles.card, style]} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: sizes.borderWidth,
    borderRadius: radii.lg,
    padding: spacing.lg,
    gap: spacing.md,
    boxShadow: shadows.card,
  },
});
