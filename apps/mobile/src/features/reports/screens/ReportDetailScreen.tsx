import { isPubliclyVisible, type Report } from '@wakasafe/domain';
import { useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';

import { useCapabilities, useCurrentUser } from '@/features/accounts';
import { format, formatDateTime, fr } from '@/lib/i18n';
import {
  AppText,
  Badge,
  Banner,
  Card,
  colors,
  ErrorView,
  Icon,
  InfoRow,
  LoadingView,
  radii,
  Screen,
  sizes,
  spacing,
} from '@/ui';
import { AppMap, canShowInteractiveMap } from '@/ui/map';

import { SeverityBadge } from '../components/SeverityBadge';
import { VotePanel } from '../components/VotePanel';
import { useReport } from '../hooks/useReports';
import { CATEGORY_ICONS, formatCoordinate, SEVERITY_COLORS, STATUS_TONES } from '../presentation';

const DETAIL_MAP_HEIGHT = 220;
const DETAIL_ZOOM = 15;

/** Report details (F2.2) and community votes (F2.4). */
export function ReportDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const report = useReport(id);

  if (report.isPending) return <LoadingView />;
  if (report.isError) {
    return (
      <Screen>
        <ErrorView error={report.error} onRetry={() => void report.refetch()} />
      </Screen>
    );
  }
  return <ReportDetails report={report.data} />;
}

function ReportDetails({ report }: { report: Report }) {
  const user = useCurrentUser();
  const { isReadOnly } = useCapabilities();
  const isAuthor = report.authorId === user.id;

  // Reports under moderation or refuted stay visible to their author only.
  if (!isAuthor && !isPubliclyVisible(report.status)) {
    return (
      <Screen testID="report-detail">
        <Banner tone="info" title={fr.reportDetail.unavailable} testID="report-unavailable" />
      </Screen>
    );
  }

  const { latitude, longitude, accuracyMeters } = report.location;
  const coordinates = {
    latitude: formatCoordinate(latitude),
    longitude: formatCoordinate(longitude),
  };
  const category = fr.enums.reportCategory[report.category];

  return (
    <Screen testID="report-detail">
      <View style={styles.header}>
        <View style={[styles.icon, { backgroundColor: SEVERITY_COLORS[report.severity] }]}>
          <Icon name={CATEGORY_ICONS[report.category]} color={colors.textInverse} />
        </View>
        <View style={styles.title}>
          <AppText variant="title" accessibilityRole="header">
            {category}
          </AppText>
          <View style={styles.badges}>
            <SeverityBadge severity={report.severity} />
            <Badge
              label={fr.enums.reportStatus[report.status]}
              tone={STATUS_TONES[report.status]}
            />
          </View>
        </View>
      </View>
      {report.photoUrl && (
        <Image
          source={{ uri: report.photoUrl }}
          style={styles.photo}
          resizeMode="cover"
          accessibilityLabel={fr.reportDetail.photoAlt}
          testID="report-detail-photo"
        />
      )}
      <Card>
        <InfoRow
          label={fr.reportDetail.affectedGroup}
          value={fr.enums.affectedGroup[report.affectedGroup]}
          icon="people-outline"
        />
        <InfoRow
          label={fr.reportDetail.occurredAt}
          value={formatDateTime(report.occurredAt)}
          icon="time-outline"
        />
        <InfoRow label={fr.reportDetail.zone} value={report.city} icon="business-outline" />
        <InfoRow
          label={fr.reportDetail.position}
          value={
            accuracyMeters === null
              ? format(fr.reportDetail.positionValue, coordinates)
              : format(fr.reportDetail.positionAccuracy, { ...coordinates, meters: accuracyMeters })
          }
          icon="location-outline"
        />
      </Card>
      {canShowInteractiveMap && (
        <AppMap
          markers={[
            {
              id: report.id,
              latitude,
              longitude,
              color: SEVERITY_COLORS[report.severity],
              label: category,
            },
          ]}
          center={{ latitude, longitude }}
          zoom={DETAIL_ZOOM}
          height={DETAIL_MAP_HEIGHT}
          accessibilityLabel={fr.reportDetail.position}
          testID="report-detail-map"
        />
      )}
      <VotePanel report={report} isAuthor={isAuthor} isReadOnly={isReadOnly} />
    </Screen>
  );
}

const ICON_FRAME = sizes.touchTarget;

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  icon: {
    width: ICON_FRAME,
    height: ICON_FRAME,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { flex: 1, gap: spacing.xs },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  photo: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceMuted,
  },
});
