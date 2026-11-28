import { BUSINESS_RULES } from './config/business-rules';
import type { ReportStatus } from './entities/reports';

// Pure M2 rules (docs/diagrams/04-domain-classes.md): ConsensusPolicy, SuspicionPolicy and
// ActionLimitPolicy. Repositories (mock today, API tomorrow) apply them; the UI reads them.

const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;
const DAY_MS = 24 * HOUR_MS;

/** Statuses shown on the public map (docs/diagrams/06-states.md, 6.2). */
export const PUBLIC_REPORT_STATUSES = [
  'CREATED',
  'VALIDATED',
  'HANDLED',
] as const satisfies readonly ReportStatus[];

/** Statuses on which the community can still confirm or refute (F2.4). */
export const VOTABLE_REPORT_STATUSES = [
  'CREATED',
  'VALIDATED',
] as const satisfies readonly ReportStatus[];

export function isPubliclyVisible(status: ReportStatus): boolean {
  return (PUBLIC_REPORT_STATUSES as readonly ReportStatus[]).includes(status);
}

export function isOpenToVotes(status: ReportStatus): boolean {
  return (VOTABLE_REPORT_STATUSES as readonly ReportStatus[]).includes(status);
}

/** Vote counters of a report, including the vote being applied. */
export interface VoteTally {
  confirmations: number;
  refutations: number;
  /** Refutations cast after the report was validated (F2.5 "strongly contested"). */
  refutationsSinceValidation: number;
}

/**
 * ConsensusPolicy (F2.4) and contested reports (F2.5): status of a report after a vote.
 * Other transitions (moderation, authority, closing) belong to the back-office.
 */
export function statusAfterVote(status: ReportStatus, tally: VoteTally): ReportStatus {
  const rules = BUSINESS_RULES.reports;
  if (status === 'CREATED') {
    if (tally.confirmations >= rules.validationThreshold) return 'VALIDATED';
    if (tally.refutations >= rules.refutationThreshold && tally.refutations > tally.confirmations) {
      return 'INVALIDATED';
    }
    return status;
  }
  if (
    status === 'VALIDATED' &&
    tally.refutationsSinceValidation >= rules.contestedAfterValidationThreshold
  ) {
    return 'SUSPICIOUS';
  }
  return status;
}

function countSince(timestamps: readonly string[], since: number, now: Date): string[] {
  return timestamps
    .filter((iso) => {
      const time = new Date(iso).getTime();
      return time > since && time <= now.getTime();
    })
    .sort();
}

/**
 * SuspicionPolicy (F2.5): an author creating more than `maxReports` reports within
 * `windowMinutes` is abnormal. `authorReportTimes` includes the new report.
 */
export function isAbnormalReportFrequency(
  authorReportTimes: readonly string[],
  now: Date,
): boolean {
  const { maxReports, windowMinutes } = BUSINESS_RULES.reports.abnormalFrequency;
  const since = now.getTime() - windowMinutes * MINUTE_MS;
  return countSince(authorReportTimes, since, now).length > maxReports;
}

export interface QuotaUsage {
  remaining: number;
  /** When the next action becomes possible again; null while some remain. */
  availableAt: string | null;
}

/** ActionLimitPolicy (F2.6): `limit` actions per rolling window of `windowHours`. */
export function rollingQuota(
  actionTimes: readonly string[],
  limit: number,
  now: Date,
  windowHours = 24,
): QuotaUsage {
  const windowMs = windowHours * HOUR_MS;
  const counted = countSince(actionTimes, now.getTime() - windowMs, now);
  const remaining = Math.max(0, limit - counted.length);
  if (remaining > 0) return { remaining, availableAt: null };
  // One action frees up when the oldest action still blocking the quota leaves the window.
  const blocking = counted[counted.length - limit]!;
  return {
    remaining,
    availableAt: new Date(new Date(blocking).getTime() + windowMs).toISOString(),
  };
}

export function reportQuota(authorReportTimes: readonly string[], now: Date): QuotaUsage {
  return rollingQuota(authorReportTimes, BUSINESS_RULES.reports.reportQuotaPer24h, now);
}

export function voteQuota(userVoteTimes: readonly string[], now: Date): QuotaUsage {
  return rollingQuota(userVoteTimes, BUSINESS_RULES.reports.voteQuotaPer24h, now);
}

/**
 * F2.6 — provisional: an abuse alert is a report flagged for abnormal frequency. Reaching
 * `abuseAlertsBeforeSuspension` alerts within `abuseWindowDays` suspends the author.
 * Returns the end of the automatic suspension, or null.
 */
export function automaticSuspensionEnd(abuseAlertTimes: readonly string[], now: Date) {
  const { abuseAlertsBeforeSuspension, abuseWindowDays, automaticSuspensionHours } =
    BUSINESS_RULES.sanctions;
  const recent = countSince(abuseAlertTimes, now.getTime() - abuseWindowDays * DAY_MS, now);
  if (recent.length < abuseAlertsBeforeSuspension) return null;
  return new Date(now.getTime() + automaticSuspensionHours * HOUR_MS).toISOString();
}
