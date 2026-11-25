import type { IsoDateTime, ReportCategory, Severity } from '@wakasafe/domain';

import type { LeaderboardRow } from './quiz';

// M9 dashboard (F9.5) and CSV export (F9.6).

export interface StatsFilters {
  from?: IsoDateTime;
  to?: IsoDateTime;
  city?: string;
}

export interface Kpis {
  reportsByCategory: Record<ReportCategory, number>;
  reportsBySeverity: Record<Severity, number>;
  reportsByCity: Record<string, number>;
  activeUsers: number;
  quizParticipants: number;
  /** null while the optional trip sharing module (M4) is not enabled. */
  sharedTrips: number | null;
  /** Top 10 contributors of the current month. */
  topContributors: LeaderboardRow[];
}

export interface HeatmapPoint {
  latitude: number;
  longitude: number;
  weight: number;
}

export type ExportDataset = 'REPORTS' | 'USERS' | 'POINTS' | 'RATINGS';
export type ExportRow = Record<string, string | number | boolean | null>;

export interface StatsRepository {
  getKpis(filters?: StatsFilters): Promise<Kpis>;
  getHeatmap(filters?: StatsFilters): Promise<HeatmapPoint[]>;
  exportRows(dataset: ExportDataset, filters?: StatsFilters): Promise<ExportRow[]>;
}
