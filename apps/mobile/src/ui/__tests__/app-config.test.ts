import appConfig from '../../../app.json';
import { colors } from '../theme';

describe('app.json', () => {
  // app.json cannot import the design tokens: this keeps its brand colours in sync (ADR-0011).
  it('uses the design token colours', () => {
    const { android, web } = appConfig.expo;
    expect({
      androidIconBackground: android.adaptiveIcon.backgroundColor,
      webThemeColor: web.themeColor,
      webBackground: web.backgroundColor,
    }).toEqual({
      androidIconBackground: colors.primarySoft,
      webThemeColor: colors.primary,
      webBackground: colors.background,
    });
  });
});
