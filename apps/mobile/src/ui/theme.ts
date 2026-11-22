import { breakpoints, theme } from '@wakasafe/design-tokens';
import { useWindowDimensions } from 'react-native';

export { theme };
export const { colors, typography, spacing, radii, sizes, shadows } = theme;

/** Mobile-first breakpoints shared with the admin app (design tokens). */
export function useResponsive() {
  const { width } = useWindowDimensions();
  return {
    width,
    isTablet: width >= breakpoints.tablet,
    isDesktop: width >= breakpoints.desktop,
  };
}
