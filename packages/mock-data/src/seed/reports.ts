import {
  BUSINESS_RULES,
  type AffectedGroup,
  type ModerationItem,
  type PointEntry,
  type Report,
  type ReportCategory,
  type ReportStatus,
  type ReportValidation,
  type Severity,
  type User,
} from '@wakasafe/domain';

import { DEMO_USER_IDS } from '../demo-accounts';
import { addMinutes, type Timeline } from './timeline';

interface ReportSpec {
  id: string;
  /** Neighbourhood, only used to document the seed (reports have no address field). */
  place: string;
  city: 'Yaoundé' | 'Douala' | 'Bafoussam';
  latitude: number;
  longitude: number;
  category: ReportCategory;
  severity: Severity;
  affectedGroup: AffectedGroup;
  hoursAgo: number;
  status: ReportStatus;
  confirmations: number;
  refutations: number;
  authorId: string;
}

// Plausible positions in the three pilot cities. Statuses and vote counts follow the
// provisional consensus rules (3 confirmations to validate, 3 refutations to invalidate).
const REPORTS: ReportSpec[] = [
  // Yaoundé
  {
    id: 'report-01',
    place: 'Poste centrale',
    city: 'Yaoundé',
    latitude: 3.8619,
    longitude: 11.518,
    category: 'TRAFFIC_LIGHT_FAILURE',
    severity: 'HIGH',
    affectedGroup: 'CAR_DRIVERS',
    hoursAgo: 5,
    status: 'VALIDATED',
    confirmations: 4,
    refutations: 0,
    authorId: DEMO_USER_IDS.citizen,
  },
  {
    id: 'report-02',
    place: 'Mvan',
    city: 'Yaoundé',
    latitude: 3.818,
    longitude: 11.516,
    category: 'DANGEROUS_POTHOLE',
    severity: 'HIGH',
    affectedGroup: 'MOTORCYCLISTS',
    hoursAgo: 30,
    status: 'VALIDATED',
    confirmations: 5,
    refutations: 1,
    authorId: 'user-101',
  },
  {
    id: 'report-03',
    place: 'Carrefour Bastos',
    city: 'Yaoundé',
    latitude: 3.889,
    longitude: 11.509,
    category: 'ACCIDENT_CRITICAL',
    severity: 'CRITICAL',
    affectedGroup: 'ALL_ROAD_USERS',
    hoursAgo: 2,
    status: 'CREATED',
    confirmations: 1,
    refutations: 0,
    authorId: 'user-111',
  },
  {
    id: 'report-04',
    place: 'Mokolo',
    city: 'Yaoundé',
    latitude: 3.873,
    longitude: 11.496,
    category: 'POORLY_MARKED_ROADWORKS',
    severity: 'MEDIUM',
    affectedGroup: 'PEDESTRIANS',
    hoursAgo: 52,
    status: 'HANDLED',
    confirmations: 3,
    refutations: 0,
    authorId: DEMO_USER_IDS.citizen,
  },
  {
    id: 'report-05',
    place: 'Essos',
    city: 'Yaoundé',
    latitude: 3.87,
    longitude: 11.542,
    category: 'FAULTY_STREET_LIGHTING',
    severity: 'MEDIUM',
    affectedGroup: 'PEDESTRIANS',
    hoursAgo: 100,
    status: 'VALIDATED',
    confirmations: 3,
    refutations: 0,
    authorId: 'user-111',
  },
  {
    id: 'report-06',
    place: 'Nsimeyong',
    city: 'Yaoundé',
    latitude: 3.827,
    longitude: 11.495,
    category: 'SLIPPERY_OR_FLOODED_ROAD',
    severity: 'HIGH',
    affectedGroup: 'ALL_ROAD_USERS',
    hoursAgo: 8,
    status: 'VALIDATED',
    confirmations: 3,
    refutations: 1,
    authorId: 'user-101',
  },
  {
    id: 'report-07',
    place: 'Olembé',
    city: 'Yaoundé',
    latitude: 3.952,
    longitude: 11.528,
    category: 'OBSTACLE',
    severity: 'LOW',
    affectedGroup: 'CAR_DRIVERS',
    hoursAgo: 40,
    status: 'INVALIDATED',
    confirmations: 0,
    refutations: 3,
    authorId: DEMO_USER_IDS.suspended,
  },
  {
    id: 'report-08',
    place: 'Ngoa-Ekellé',
    city: 'Yaoundé',
    latitude: 3.858,
    longitude: 11.499,
    category: 'PERSON_IN_DISTRESS',
    severity: 'CRITICAL',
    affectedGroup: 'PEDESTRIANS',
    hoursAgo: 1,
    status: 'CREATED',
    confirmations: 0,
    refutations: 0,
    authorId: DEMO_USER_IDS.citizen,
  },
  {
    id: 'report-09',
    place: 'Biyem-Assi',
    city: 'Yaoundé',
    latitude: 3.835,
    longitude: 11.485,
    category: 'DANGEROUS_POTHOLE',
    severity: 'MEDIUM',
    affectedGroup: 'MOTORCYCLISTS',
    hoursAgo: 200,
    status: 'CLOSED',
    confirmations: 4,
    refutations: 0,
    authorId: 'user-111',
  },
  // Douala
  {
    id: 'report-10',
    place: 'Rond-point Deïdo',
    city: 'Douala',
    latitude: 4.064,
    longitude: 9.711,
    category: 'TRAFFIC_LIGHT_FAILURE',
    severity: 'HIGH',
    affectedGroup: 'ALL_ROAD_USERS',
    hoursAgo: 6,
    status: 'VALIDATED',
    confirmations: 4,
    refutations: 0,
    authorId: 'user-102',
  },
  {
    id: 'report-11',
    place: 'Akwa',
    city: 'Douala',
    latitude: 4.048,
    longitude: 9.7,
    category: 'POORLY_MARKED_ROADWORKS',
    severity: 'HIGH',
    affectedGroup: 'CAR_DRIVERS',
    hoursAgo: 26,
    status: 'VALIDATED',
    confirmations: 3,
    refutations: 0,
    authorId: 'user-112',
  },
  {
    id: 'report-12',
    place: 'Bonabéri',
    city: 'Douala',
    latitude: 4.07,
    longitude: 9.68,
    category: 'DAMAGED_BRIDGE',
    severity: 'CRITICAL',
    affectedGroup: 'ALL_ROAD_USERS',
    hoursAgo: 70,
    status: 'VALIDATED',
    confirmations: 5,
    refutations: 0,
    authorId: 'user-103',
  },
  {
    id: 'report-13',
    place: 'Ndokoti',
    city: 'Douala',
    latitude: 4.045,
    longitude: 9.738,
    category: 'ACCIDENT_CRITICAL',
    severity: 'HIGH',
    affectedGroup: 'MOTORCYCLISTS',
    hoursAgo: 3,
    status: 'VALIDATED',
    confirmations: 3,
    refutations: 0,
    authorId: 'user-110',
  },
  {
    id: 'report-14',
    place: 'Logbessou',
    city: 'Douala',
    latitude: 4.095,
    longitude: 9.78,
    category: 'SLIPPERY_OR_FLOODED_ROAD',
    severity: 'HIGH',
    affectedGroup: 'PUBLIC_TRANSPORT',
    hoursAgo: 15,
    status: 'VALIDATED',
    confirmations: 4,
    refutations: 2,
    authorId: 'user-102',
  },
  {
    id: 'report-15',
    place: 'Bépanda',
    city: 'Douala',
    latitude: 4.069,
    longitude: 9.729,
    category: 'OBSTACLE',
    severity: 'MEDIUM',
    affectedGroup: 'CAR_DRIVERS',
    hoursAgo: 14,
    status: 'SUSPICIOUS',
    confirmations: 3,
    refutations: 3,
    authorId: 'user-112',
  },
  {
    id: 'report-16',
    place: 'Bonapriso',
    city: 'Douala',
    latitude: 4.033,
    longitude: 9.693,
    category: 'FAULTY_STREET_LIGHTING',
    severity: 'LOW',
    affectedGroup: 'PEDESTRIANS',
    hoursAgo: 40,
    status: 'CREATED',
    confirmations: 2,
    refutations: 0,
    authorId: 'user-103',
  },
  {
    id: 'report-17',
    place: 'Makepe',
    city: 'Douala',
    latitude: 4.072,
    longitude: 9.76,
    category: 'DANGEROUS_POTHOLE',
    severity: 'HIGH',
    affectedGroup: 'MOTORCYCLISTS',
    hoursAgo: 0.5,
    status: 'CREATED',
    confirmations: 0,
    refutations: 0,
    authorId: DEMO_USER_IDS.driver,
  },
  {
    id: 'report-18',
    place: 'Village',
    city: 'Douala',
    latitude: 4.02,
    longitude: 9.755,
    category: 'ACCIDENT_CRITICAL',
    severity: 'MEDIUM',
    affectedGroup: 'CAR_DRIVERS',
    hoursAgo: 90,
    status: 'CLOSED',
    confirmations: 3,
    refutations: 0,
    authorId: 'user-110',
  },
  // Bafoussam
  {
    id: 'report-19',
    place: 'Marché A',
    city: 'Bafoussam',
    latitude: 5.478,
    longitude: 10.42,
    category: 'POORLY_MARKED_ROADWORKS',
    severity: 'MEDIUM',
    affectedGroup: 'PEDESTRIANS',
    hoursAgo: 10,
    status: 'VALIDATED',
    confirmations: 3,
    refutations: 0,
    authorId: 'user-104',
  },
  {
    id: 'report-20',
    place: 'Carrefour Tamdja',
    city: 'Bafoussam',
    latitude: 5.49,
    longitude: 10.41,
    category: 'TRAFFIC_LIGHT_FAILURE',
    severity: 'HIGH',
    affectedGroup: 'CAR_DRIVERS',
    hoursAgo: 20,
    status: 'VALIDATED',
    confirmations: 3,
    refutations: 0,
    authorId: DEMO_USER_IDS.pendingDriver,
  },
  {
    id: 'report-21',
    place: 'Route de Bamenda',
    city: 'Bafoussam',
    latitude: 5.505,
    longitude: 10.4,
    category: 'LANDSLIDE',
    severity: 'CRITICAL',
    affectedGroup: 'ALL_ROAD_USERS',
    hoursAgo: 7,
    status: 'VALIDATED',
    confirmations: 4,
    refutations: 0,
    authorId: 'user-109',
  },
  {
    id: 'report-22',
    place: 'Kouogouo',
    city: 'Bafoussam',
    latitude: 5.46,
    longitude: 10.43,
    category: 'DANGEROUS_POTHOLE',
    severity: 'MEDIUM',
    affectedGroup: 'MOTORCYCLISTS',
    hoursAgo: 48,
    status: 'VALIDATED',
    confirmations: 3,
    refutations: 1,
    authorId: 'user-104',
  },
  {
    id: 'report-23',
    place: 'Djeleng',
    city: 'Bafoussam',
    latitude: 5.47,
    longitude: 10.405,
    category: 'SLIPPERY_OR_FLOODED_ROAD',
    severity: 'MEDIUM',
    affectedGroup: 'CHILDREN_STUDENTS',
    hoursAgo: 3,
    status: 'CREATED',
    confirmations: 1,
    refutations: 1,
    authorId: 'user-106',
  },
  {
    id: 'report-24',
    place: 'Tougang',
    city: 'Bafoussam',
    latitude: 5.495,
    longitude: 10.435,
    category: 'OBSTACLE',
    severity: 'LOW',
    affectedGroup: 'CAR_DRIVERS',
    hoursAgo: 9,
    status: 'SUSPICIOUS',
    confirmations: 3,
    refutations: 3,
    authorId: 'user-106',
  },
];

const HANDLED_REPORTS: Record<string, number> = { 'report-04': 20 };
const CLOSED_REPORTS: Record<string, number> = { 'report-09': 30, 'report-18': 12 };

/** Statuses for which the author has received the "validated report" points. */
const REWARDED_STATUSES: readonly ReportStatus[] = ['VALIDATED', 'HANDLED', 'CLOSED'];

export interface SeedReports {
  reports: Report[];
  reportValidations: ReportValidation[];
  moderationItems: ModerationItem[];
  pointEntries: PointEntry[];
}

export function seedReports(t: Timeline, users: User[]): SeedReports {
  // Voters: active client users (no administrator, no suspended account), never the author.
  const voterPool = users
    .filter((u) => u.role !== 'ADMIN' && u.status === 'ACTIVE')
    .map((u) => u.id);
  const reports: Report[] = [];
  const reportValidations: ReportValidation[] = [];
  const moderationItems: ModerationItem[] = [];
  const pointEntries: PointEntry[] = [];

  REPORTS.forEach((spec, index) => {
    const createdAt = t.hoursAgo(spec.hoursAgo);
    const voters = voterPool.filter((id) => id !== spec.authorId);
    const voteCount = spec.confirmations + spec.refutations;
    // Votes are spread over the report lifetime, at most 30 minutes apart.
    const step = Math.min(30, (spec.hoursAgo * 60) / (voteCount + 1));

    for (let v = 0; v < voteCount; v += 1) {
      reportValidations.push({
        id: `validation-${spec.id}-${v + 1}`,
        reportId: spec.id,
        userId: voters[(index * 3 + v) % voters.length]!,
        verdict: v < spec.confirmations ? 'CONFIRM' : 'REFUTE',
        createdAt: addMinutes(createdAt, step * (v + 1)),
      });
    }

    const handledHoursAgo = HANDLED_REPORTS[spec.id];
    const closedHoursAgo = CLOSED_REPORTS[spec.id];
    reports.push({
      id: spec.id,
      clientId: `seed-${spec.id}`,
      authorId: spec.authorId,
      category: spec.category,
      severity: spec.severity,
      affectedGroup: spec.affectedGroup,
      location: { latitude: spec.latitude, longitude: spec.longitude, accuracyMeters: 15 },
      city: spec.city,
      photoUrl: null,
      occurredAt: addMinutes(createdAt, -10),
      createdAt,
      status: spec.status,
      origin: index % 7 === 3 ? 'OFFLINE_SYNCED' : 'ONLINE',
      confirmations: spec.confirmations,
      refutations: spec.refutations,
      handledBy: handledHoursAgo === undefined ? null : DEMO_USER_IDS.authority,
      handledAt: handledHoursAgo === undefined ? null : t.hoursAgo(handledHoursAgo),
      closedAt: closedHoursAgo === undefined ? null : t.hoursAgo(closedHoursAgo),
    });

    if (REWARDED_STATUSES.includes(spec.status)) {
      const threshold = BUSINESS_RULES.reports.validationThreshold;
      pointEntries.push({
        id: `points-${spec.id}`,
        userId: spec.authorId,
        reason: 'REPORT_VALIDATED',
        points: BUSINESS_RULES.points.REPORT_VALIDATED,
        sourceType: 'REPORT',
        sourceId: spec.id,
        createdAt: addMinutes(createdAt, step * threshold),
      });
    }

    if (spec.status === 'SUSPICIOUS') {
      moderationItems.push({
        id: `moderation-${spec.id}`,
        targetType: 'REPORT',
        targetId: spec.id,
        reason: 'MANY_REFUTATIONS',
        status: 'OPEN',
        createdAt: addMinutes(createdAt, step * voteCount),
        resolvedBy: null,
        resolvedAt: null,
        decision: null,
      });
    }
  });

  moderationItems.push({
    id: 'moderation-account-105',
    targetType: 'ACCOUNT',
    targetId: DEMO_USER_IDS.suspended,
    reason: 'ACTION_LIMIT_ABUSE',
    status: 'RESOLVED',
    createdAt: t.hoursAgo(24),
    resolvedBy: null,
    resolvedAt: t.hoursAgo(24),
    decision: 'Suspension automatique de 72 h (F2.6).',
  });

  return { reports, reportValidations, moderationItems, pointEntries };
}
