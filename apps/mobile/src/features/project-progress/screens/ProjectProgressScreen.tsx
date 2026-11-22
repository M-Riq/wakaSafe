import { StyleSheet, View } from 'react-native';

import { format, formatDate, fr, plural } from '@/lib/i18n';
import { AppText, Card, ProgressBar, Screen, spacing } from '@/ui';

import { PhaseCard } from '../components/PhaseCard';
import { roadmap as defaultRoadmap, summarizeRoadmap, type Roadmap } from '../roadmap';

/** Public page where GOSAFE follows the phases of the MVP (data: roadmap.json). */
export function ProjectProgressScreen({ roadmap = defaultRoadmap }: { roadmap?: Roadmap }) {
  const { done, total, current } = summarizeRoadmap(roadmap);
  const overall = format(plural(done, fr.progress.overall), { done, total });
  return (
    <Screen testID="project-progress">
      <View style={styles.header}>
        <AppText variant="title">{fr.progress.title}</AppText>
        <AppText tone="muted">{fr.progress.subtitle}</AppText>
        <AppText variant="caption" tone="subtle">
          {format(fr.progress.updatedAt, { date: formatDate(`${roadmap.updatedAt}T12:00:00Z`) })}
        </AppText>
      </View>
      <Card>
        <AppText variant="heading">{overall}</AppText>
        <ProgressBar value={total ? done / total : 0} accessibilityLabel={overall} />
      </Card>
      {current && (
        <View style={styles.section}>
          <AppText variant="label" tone="muted">
            {fr.progress.current}
          </AppText>
          <PhaseCard phase={current} highlighted />
        </View>
      )}
      <View style={styles.section}>
        {roadmap.phases
          .filter((phase) => phase !== current)
          .map((phase) => (
            <PhaseCard key={phase.number} phase={phase} />
          ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: spacing.xs },
  section: { gap: spacing.md },
});
