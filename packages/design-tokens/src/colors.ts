/**
 * Neutral, provisional palette. GOSAFE's official brand guidelines will replace
 * these values here, in a single place, without touching the apps.
 */
export const palette = {
  white: '#FFFFFF',
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate900: '#0F172A',
  blue50: '#EAF2FB',
  blue600: '#0B5CAD',
  blue800: '#08427D',
  green50: '#E7F6EC',
  green700: '#067647',
  green800: '#05603A',
  amber50: '#FEF6E0',
  amber400: '#F5B225',
  amber800: '#8A3B05',
  orange700: '#B93815',
  red50: '#FDECEA',
  red700: '#B42318',
  red800: '#912018',
} as const;

export const colors = {
  background: palette.slate50,
  surface: palette.white,
  surfaceMuted: palette.slate100,
  border: palette.slate200,
  borderStrong: palette.slate300,

  text: palette.slate900,
  textMuted: palette.slate600,
  textSubtle: palette.slate500,
  textInverse: palette.white,

  primary: palette.blue600,
  primaryPressed: palette.blue800,
  onPrimary: palette.white,
  primarySoft: palette.blue50,
  onPrimarySoft: palette.blue800,

  success: palette.green700,
  onSuccess: palette.white,
  successSoft: palette.green50,
  onSuccessSoft: palette.green800,

  warning: palette.amber400,
  onWarning: palette.slate900,
  warningSoft: palette.amber50,
  onWarningSoft: palette.amber800,

  danger: palette.red700,
  onDanger: palette.white,
  dangerSoft: palette.red50,
  onDangerSoft: palette.red800,

  focusRing: palette.blue600,
  overlay: 'rgba(15, 23, 42, 0.45)',

  /** Report severity scale (F2.2). Each colour is readable with white text. */
  severity: {
    low: palette.slate600,
    medium: palette.amber800,
    high: palette.orange700,
    critical: palette.red700,
  },
} as const;

export type ColorTokens = typeof colors;
