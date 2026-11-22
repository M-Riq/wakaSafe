/** 4-point spacing scale, in density-independent pixels (dp / CSS px). */
export const spacing = {
  none: 0,
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
} as const;

export const radii = {
  sm: 6,
  md: 10,
  lg: 16,
  pill: 999,
} as const;

export const sizes = {
  /** Minimum touch target (accessibility convention: 48 x 48 dp). */
  touchTarget: 48,
  iconSm: 16,
  iconMd: 24,
  iconLg: 32,
  borderWidth: 1,
  /** Max width of reading content on large screens (web). */
  contentMaxWidth: 720,
  /** Max width of wide layouts such as dashboards (web). */
  wideMaxWidth: 1120,
} as const;

/** Minimum viewport widths, mobile-first. */
export const breakpoints = {
  tablet: 768,
  desktop: 1024,
} as const;

/** CSS-like shadows, supported by React Native (new architecture) and by the web. */
export const shadows = {
  card: '0px 1px 3px rgba(15, 23, 42, 0.12)',
  raised: '0px 4px 12px rgba(15, 23, 42, 0.16)',
} as const;

export type SpacingToken = keyof typeof spacing;
export type BreakpointToken = keyof typeof breakpoints;
