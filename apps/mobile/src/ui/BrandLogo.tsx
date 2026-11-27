import { StyleSheet, View } from 'react-native';

import { Icon } from './Icon';
import { colors, radii, sizes, spacing } from './theme';

/**
 * Provisional WakaSafe mark. The official logo from the GOSAFE brand guidelines
 * replaces the content of this component only (ADR-0011).
 */
export function BrandLogo() {
  return (
    <View style={styles.logo} testID="brand-logo">
      <Icon name="shield-checkmark" size={sizes.iconLg + spacing.lg} color={colors.onPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    width: sizes.touchTarget * 2,
    height: sizes.touchTarget * 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
});
