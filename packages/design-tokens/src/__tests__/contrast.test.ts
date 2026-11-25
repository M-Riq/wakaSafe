import { colors, contrastRatio, parseHexColor, WCAG_AA } from '../index';

describe('contrastRatio', () => {
  it('matches the WCAG reference values', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#FFFFFF', '#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
  });

  it('rejects colours that are not #RRGGBB', () => {
    expect(() => parseHexColor('rgba(0,0,0,1)')).toThrow('#RRGGBB');
  });
});

describe('theme colours', () => {
  const textPairs: [string, string, string][] = [
    ['text / background', colors.text, colors.background],
    ['text / surface', colors.text, colors.surface],
    ['text / surfaceMuted', colors.text, colors.surfaceMuted],
    ['textMuted / surface', colors.textMuted, colors.surface],
    ['textMuted / background', colors.textMuted, colors.background],
    ['textMuted / surfaceMuted', colors.textMuted, colors.surfaceMuted],
    ['textSubtle / surface', colors.textSubtle, colors.surface],
    ['onPrimary / primary', colors.onPrimary, colors.primary],
    ['onPrimary / primaryPressed', colors.onPrimary, colors.primaryPressed],
    ['primary / surface (links)', colors.primary, colors.surface],
    ['onPrimarySoft / primarySoft', colors.onPrimarySoft, colors.primarySoft],
    ['onSuccess / success', colors.onSuccess, colors.success],
    ['onSuccessSoft / successSoft', colors.onSuccessSoft, colors.successSoft],
    ['onWarning / warning', colors.onWarning, colors.warning],
    ['onWarningSoft / warningSoft', colors.onWarningSoft, colors.warningSoft],
    ['onDanger / danger', colors.onDanger, colors.danger],
    ['onDangerSoft / dangerSoft', colors.onDangerSoft, colors.dangerSoft],
    ['danger / surface', colors.danger, colors.surface],
    ...Object.entries(colors.severity).map(([name, value]): [string, string, string] => [
      `white / severity.${name}`,
      '#FFFFFF',
      value,
    ]),
  ];

  it.each(textPairs)('%s meets WCAG AA for body text', (_label, foreground, background) => {
    expect(contrastRatio(foreground, background)).toBeGreaterThanOrEqual(WCAG_AA.normalText);
  });

  it('keeps borders and focus ring distinguishable from the surface (UI components)', () => {
    expect(contrastRatio(colors.focusRing, colors.surface)).toBeGreaterThanOrEqual(
      WCAG_AA.largeText,
    );
  });
});
