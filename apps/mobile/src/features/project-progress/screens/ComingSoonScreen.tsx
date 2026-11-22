import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { format, fr } from '@/lib/i18n';
import {
  AppText,
  Badge,
  Button,
  Card,
  colors,
  Icon,
  radii,
  Screen,
  sizes,
  spacing,
  type IconName,
} from '@/ui';

import { STATUS_STYLE } from '../components/PhaseCard';
import { getPhase } from '../roadmap';

export type UpcomingModule = 'map' | 'report' | 'quiz' | 'leaderboard';

interface ComingSoonScreenProps {
  module: UpcomingModule;
  phase: number;
  icon: IconName;
}

/** Placeholder of a module that is not built yet, with its planned phase. */
export function ComingSoonScreen({ module, phase: phaseNumber, icon }: ComingSoonScreenProps) {
  const texts = fr.comingSoon[module];
  const phase = getPhase(phaseNumber);
  const router = useRouter();
  return (
    <Screen testID={`coming-soon-${module}`}>
      <Card style={styles.card}>
        <View style={styles.icon}>
          <Icon name={icon} size={sizes.iconLg + spacing.sm} color={colors.primary} />
        </View>
        <AppText variant="title" style={styles.centered}>
          {texts.title}
        </AppText>
        <AppText tone="muted" style={styles.centered}>
          {texts.description}
        </AppText>
        <View style={styles.badges}>
          <Badge label={format(fr.comingSoon.plannedIn, { phase: phaseNumber })} tone="primary" />
          {phase && (
            <Badge
              label={fr.progress.status[phase.status]}
              tone={STATUS_STYLE[phase.status].tone}
              icon={STATUS_STYLE[phase.status].icon}
            />
          )}
        </View>
        {phase && phase.requirements.length > 0 && (
          <AppText variant="caption" tone="subtle" style={styles.centered}>
            {format(fr.comingSoon.requirements, { list: phase.requirements.join(', ') })}
          </AppText>
        )}
        <Button
          label={fr.comingSoon.seeProgress}
          variant="secondary"
          icon="git-branch-outline"
          onPress={() => router.push('/project-progress')}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', paddingVertical: spacing['2xl'] },
  icon: {
    width: sizes.touchTarget + spacing.xl,
    height: sizes.touchTarget + spacing.xl,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primarySoft,
  },
  centered: { textAlign: 'center' },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, justifyContent: 'center' },
});
