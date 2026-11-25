import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { fr } from '@/lib/i18n';
import {
  AppText,
  Badge,
  Banner,
  Button,
  Card,
  colors,
  Icon,
  radii,
  Screen,
  sizes,
  spacing,
} from '@/ui';

export function WelcomeScreen() {
  const router = useRouter();
  return (
    <Screen testID="welcome">
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Icon name="shield-checkmark" size={sizes.iconLg + spacing.lg} color={colors.onPrimary} />
        </View>
        <View style={styles.brand}>
          <AppText variant="display">{fr.common.appName}</AppText>
          <Badge label={fr.common.demoBadge} tone="warning" />
        </View>
        <AppText variant="heading" tone="primary" style={styles.centered}>
          {fr.common.tagline}
        </AppText>
      </View>
      <Card>
        <AppText variant="title">{fr.welcome.title}</AppText>
        <AppText tone="muted">{fr.welcome.subtitle}</AppText>
        <View style={styles.features}>
          {fr.welcome.features.map((feature) => (
            <View key={feature.text} style={styles.feature}>
              <Icon name={feature.icon} color={colors.primary} />
              <AppText style={styles.featureText}>{feature.text}</AppText>
            </View>
          ))}
        </View>
      </Card>
      <View style={styles.actions}>
        <Button
          label={fr.welcome.signIn}
          icon="log-in-outline"
          onPress={() => router.push('/login')}
          testID="welcome-sign-in"
        />
        <Button
          label={fr.welcome.register}
          variant="secondary"
          icon="person-add-outline"
          onPress={() => router.push('/register')}
          testID="welcome-register"
        />
        <Button
          label={fr.welcome.tryDemo}
          variant="ghost"
          icon="people-outline"
          onPress={() => router.push('/demo-access')}
          testID="welcome-try-demo"
        />
      </View>
      <Banner tone="info" title={fr.common.placeholderContent}>
        {fr.welcome.demoNotice}
      </Banner>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: spacing.md, paddingTop: spacing.xl },
  logo: {
    width: sizes.touchTarget * 2,
    height: sizes.touchTarget * 2,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  brand: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  centered: { textAlign: 'center' },
  features: { gap: spacing.md },
  feature: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  featureText: { flex: 1 },
  actions: { gap: spacing.sm },
});
