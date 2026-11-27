import type { NativeStackNavigationOptions } from 'expo-router/native-stack';
import { HeaderBackButton, type HeaderBackButtonProps } from 'expo-router/react-navigation';
import { Platform } from 'react-native';

import { fr } from '@/lib/i18n';

import { colors, typography } from './theme';

/** Shared header style of the stacks and tabs. */
export const headerOptions = {
  headerTintColor: colors.primary,
  headerTitleStyle: { color: colors.text, fontWeight: typography.fontWeight.semibold },
  headerStyle: { backgroundColor: colors.surface },
} as const;

type HeaderLeft = NonNullable<NativeStackNavigationOptions['headerLeft']>;

/**
 * The web header labels its back button "<previous title>, back" in English. The web header
 * passes the full back button props (onPress, href…), so the same button is rendered with a
 * French label. Android keeps its native header and system label.
 */
const webHeaderLeft: HeaderLeft = (props) =>
  props.canGoBack ? (
    <HeaderBackButton {...(props as HeaderBackButtonProps)} accessibilityLabel={fr.common.back} />
  ) : null;

/** Header options of the stacks (root, visitor and signed-in areas). */
export const stackHeaderOptions: NativeStackNavigationOptions = {
  ...headerOptions,
  ...(Platform.OS === 'web' ? { headerLeft: webHeaderLeft } : {}),
};
