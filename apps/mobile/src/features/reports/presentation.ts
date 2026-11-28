import {
  AffectedGroupSchema,
  ReportCategorySchema,
  SeveritySchema,
  type ReportCategory,
  type ReportStatus,
  type Severity,
} from '@wakasafe/domain';

import { colors, type BadgeTone, type IconName } from '@/ui';

export const REPORT_CATEGORIES = ReportCategorySchema.options;
export const SEVERITIES = SeveritySchema.options;
export const AFFECTED_GROUPS = AffectedGroupSchema.options;

export const CATEGORY_ICONS: Record<ReportCategory, IconName> = {
  ACCIDENT_CRITICAL: 'car-outline',
  OBSTACLE: 'cube-outline',
  DAMAGED_BRIDGE: 'trail-sign-outline',
  DANGEROUS_POTHOLE: 'ellipse-outline',
  SLIPPERY_OR_FLOODED_ROAD: 'water-outline',
  LANDSLIDE: 'layers-outline',
  FAULTY_STREET_LIGHTING: 'bulb-outline',
  TRAFFIC_LIGHT_FAILURE: 'flash-off-outline',
  POORLY_MARKED_ROADWORKS: 'construct-outline',
  PERSON_IN_DISTRESS: 'medkit-outline',
};

export const SEVERITY_COLORS: Record<Severity, string> = {
  LOW: colors.severity.low,
  MEDIUM: colors.severity.medium,
  HIGH: colors.severity.high,
  CRITICAL: colors.severity.critical,
};

export const STATUS_TONES: Record<ReportStatus, BadgeTone> = {
  CREATED: 'neutral',
  VALIDATED: 'success',
  INVALIDATED: 'danger',
  SUSPICIOUS: 'warning',
  HANDLED: 'primary',
  CLOSED: 'neutral',
};

/** Idempotency key of a draft (offline replays reuse it, F3.2). */
export function createClientId(): string {
  const random = Math.floor(Math.random() * 0x1000000).toString(36);
  return `client-${Date.now().toString(36)}-${random}`;
}

/** 5 decimals ≈ 1 m: precise enough to find the place, short enough to read. */
export function formatCoordinate(value: number): string {
  return value.toFixed(5);
}
