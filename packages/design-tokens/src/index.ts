import { colors } from './colors';
import { breakpoints, radii, shadows, sizes, spacing } from './layout';
import { typography } from './typography';

export { colors, palette } from './colors';
export type { ColorTokens } from './colors';
export { typography } from './typography';
export type { FontSizeToken, TypographyTokens } from './typography';
export { breakpoints, radii, shadows, sizes, spacing } from './layout';
export type { BreakpointToken, SpacingToken } from './layout';
export { contrastRatio, parseHexColor, relativeLuminance, WCAG_AA } from './contrast';

export const theme = {
  colors,
  typography,
  spacing,
  radii,
  sizes,
  breakpoints,
  shadows,
} as const;

export type Theme = typeof theme;
