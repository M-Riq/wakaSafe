import { fr } from '@/lib/i18n';
import { AppText, Banner, Card, Screen } from '@/ui';

/** Terms of use. Provisional text until GOSAFE provides the final one. */
export function TermsScreen() {
  return (
    <Screen testID="terms">
      <Banner tone="warning" title={fr.terms.provisionalTitle}>
        {fr.terms.provisional}
      </Banner>
      {fr.terms.sections.map((section) => (
        <Card key={section.title}>
          <AppText variant="heading" accessibilityRole="header">
            {section.title}
          </AppText>
          <AppText>{section.body}</AppText>
        </Card>
      ))}
    </Screen>
  );
}
