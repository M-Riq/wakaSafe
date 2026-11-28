import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { useCurrentUser } from '@/features/accounts';
import { fr } from '@/lib/i18n';
import { AppText, Button, ErrorView, LoadingView, Screen, spacing } from '@/ui';

import { ReportCard } from '../components/ReportCard';
import { useReportList } from '../hooks/useReports';

/** The author's reports, whatever their status, most recent first. */
export function MyReportsScreen() {
  const router = useRouter();
  const user = useCurrentUser();
  const reports = useReportList({ authorId: user.id });

  if (reports.isPending) return <LoadingView />;
  if (reports.isError) {
    return (
      <Screen>
        <ErrorView error={reports.error} onRetry={() => void reports.refetch()} />
      </Screen>
    );
  }

  return (
    <Screen testID="my-reports">
      <AppText tone="muted">{fr.myReports.intro}</AppText>
      {reports.data.length === 0 && (
        <>
          <AppText testID="my-reports-empty">{fr.myReports.empty}</AppText>
          <Button
            label={fr.myReports.report}
            icon="warning-outline"
            onPress={() => router.navigate('/report')}
          />
        </>
      )}
      <View style={styles.list}>
        {reports.data.map((report) => (
          <ReportCard
            key={report.id}
            report={report}
            showVotes
            onPress={() => router.push(`/reports/${report.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
});
