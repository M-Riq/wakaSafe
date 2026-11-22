import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { colors, sizes, spacing, useResponsive } from './theme';

interface ScreenProps {
  children: ReactNode;
  /** Wider content on large screens (lists, dashboards). */
  wide?: boolean;
  testID?: string;
}

/** Scrollable page, centred with a readable max width on large web screens. */
export function Screen({ children, wide = false, testID }: ScreenProps) {
  const { isTablet } = useResponsive();
  return (
    <ScrollView
      testID={testID}
      style={styles.scroll}
      contentContainerStyle={[
        styles.container,
        { padding: isTablet ? spacing['2xl'] : spacing.lg },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <View
        style={[styles.content, { maxWidth: wide ? sizes.wideMaxWidth : sizes.contentMaxWidth }]}
      >
        {children}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', gap: spacing.lg },
});
