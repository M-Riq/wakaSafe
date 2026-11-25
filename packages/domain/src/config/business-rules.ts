import type { ReportCategory, Severity } from '../entities/reports';
import type { PointReason } from '../entities/points';

/**
 * Business parameters, centralised in one place (docs/architecture/business-rules.md).
 * Every value marked "provisional" must be validated by GOSAFE before production.
 */
export const BUSINESS_RULES = {
  reports: {
    /** F2.4 — provisional. */
    validationThreshold: 3,
    /** F2.4 — provisional: also requires more refutations than confirmations. */
    refutationThreshold: 3,
    /** F2.5 — provisional: refutations after validation that make a report suspicious. */
    contestedAfterValidationThreshold: 3,
    /** F2.5 — provisional: more than `maxReports` in `windowMinutes` is abnormal. */
    abnormalFrequency: { maxReports: 5, windowMinutes: 10 },
    /** F2.6 — provisional: rolling 24 h quotas. */
    reportQuotaPer24h: 10,
    voteQuotaPer24h: 30,
    /** Provisional: validated reports auto-close after N days without being handled... */
    autoCloseAfterDays: 7,
    /** ...except for these long-lasting categories. */
    durableCategories: [
      'DAMAGED_BRIDGE',
      'FAULTY_STREET_LIGHTING',
      'TRAFFIC_LIGHT_FAILURE',
    ] as readonly ReportCategory[],
  },
  sanctions: {
    /** F2.6 — provisional: N abuse alerts in `windowDays` trigger an automatic suspension. */
    abuseAlertsBeforeSuspension: 3,
    abuseWindowDays: 7,
    automaticSuspensionHours: 72,
  },
  quiz: {
    /** F5.2 — fixed by the specification. */
    questionsPerDay: 5,
    /** Provisional: calendar day in Africa/Douala (UTC+1, no daylight saving time). */
    timeZone: 'Africa/Douala',
    utcOffsetMinutes: 60,
  },
  /** F5.3 — provisional point scale. */
  points: {
    REPORT_VALIDATED: 10,
    QUIZ_CORRECT_ANSWER: 2,
    RATING_SUBMITTED: 3,
  } satisfies Record<PointReason, number>,
  ratings: {
    /** F6.1 — provisional: 1 to 5 stars per criterion. */
    minScore: 1,
    maxScore: 5,
    /** F6.3 — provisional: one rating per passenger and driver every N days. */
    periodDays: 30,
  },
  notifications: {
    /** F7.1 — provisional, user-adjustable in the preferences. */
    defaultNearbyRadiusKm: 2,
    nearbyAlertSeverities: ['HIGH', 'CRITICAL'] as readonly Severity[],
  },
  profileRequests: {
    /** F1.3 — provisional: a user may submit a new request after a rejection. */
    allowNewRequestAfterRejection: true,
  },
} as const;

/** Pilot cities (phase pilote). */
export const PILOT_CITIES = ['Yaoundé', 'Douala', 'Bafoussam'] as const;
export type PilotCity = (typeof PILOT_CITIES)[number];
