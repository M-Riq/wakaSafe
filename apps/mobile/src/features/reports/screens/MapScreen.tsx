import type { Report } from '@wakasafe/domain';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { format, fr, plural } from '@/lib/i18n';
import { AppText, Button, ErrorView, LoadingView, Screen, spacing, useResponsive } from '@/ui';
import { AppMap, type MapMarker } from '@/ui/map';

import { FilterPanel } from '../components/FilterPanel';
import { ReportCard } from '../components/ReportCard';
import {
  activeFilterCount,
  mapViewFor,
  NO_FILTERS,
  toPublicReportFilters,
  type MapFilters,
} from '../filters';
import { useReportList } from '../hooks/useReports';
import { SEVERITY_COLORS } from '../presentation';

function toMarker(report: Report): MapMarker {
  return {
    id: report.id,
    latitude: report.location.latitude,
    longitude: report.location.longitude,
    color: SEVERITY_COLORS[report.severity],
    label: `${fr.enums.reportCategory[report.category]} · ${fr.enums.severity[report.severity]}`,
  };
}

/** F2.3 public map of active reports, with filters by type, severity and zone. */
export function MapScreen() {
  const router = useRouter();
  const { isDesktop } = useResponsive();
  const [filters, setFilters] = useState<MapFilters>(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const reports = useReportList(toPublicReportFilters(filters));
  const view = mapViewFor(filters.city);
  const openReport = (reportId: string) => router.push(`/reports/${reportId}`);

  const filterCount = activeFilterCount(filters);
  const filterLabel = filtersOpen
    ? fr.reportMap.hideFilters
    : filterCount > 0
      ? format(fr.reportMap.filtersActive, { count: filterCount })
      : fr.reportMap.filters;

  return (
    <Screen wide testID="map-screen">
      <View style={styles.toolbar}>
        <Button
          label={filterLabel}
          variant="secondary"
          icon={filtersOpen ? 'chevron-up' : 'options-outline'}
          onPress={() => setFiltersOpen((open) => !open)}
          testID="map-filters-toggle"
        />
        {reports.data && (
          <AppText tone="muted" accessibilityLiveRegion="polite" testID="map-results">
            {format(plural(reports.data.length, fr.reportMap.results), {
              count: reports.data.length,
            })}
          </AppText>
        )}
      </View>
      {filtersOpen && <FilterPanel filters={filters} onChange={setFilters} />}
      <AppMap
        markers={(reports.data ?? []).map(toMarker)}
        center={view.center}
        zoom={view.zoom}
        height={isDesktop ? 480 : 320}
        accessibilityLabel={fr.reportMap.mapLabel}
        onMarkerPress={openReport}
        testID="report-map"
      />
      {reports.isPending && <LoadingView />}
      {reports.isError && (
        <ErrorView error={reports.error} onRetry={() => void reports.refetch()} />
      )}
      {reports.data?.length === 0 && (
        <AppText tone="muted" testID="map-empty">
          {fr.reportMap.empty}
        </AppText>
      )}
      <View style={styles.list}>
        {reports.data?.map((report) => (
          <ReportCard key={report.id} report={report} onPress={() => openReport(report.id)} />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  list: { gap: spacing.sm },
});
