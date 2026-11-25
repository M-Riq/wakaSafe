import { colors, typography } from './theme';

/** Shared header style of the stacks and tabs. */
export const headerOptions = {
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: typography.fontWeight.semibold },
  headerStyle: { backgroundColor: colors.surface },
} as const;
