import type {
  Id,
  IsoDateTime,
  ModerationItem,
  Report,
  ReportCategory,
  ReportDraft,
  ReportOrigin,
  ReportStatus,
  Severity,
  Verdict,
} from '@wakasafe/domain';

// M2 reports (and M3 synchronisation), F2.5/F9.3 moderation.

export interface GeoBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/** F2.3 public map filters (type, severity, zone). */
export interface ReportFilters {
  categories?: ReportCategory[];
  severities?: Severity[];
  statuses?: ReportStatus[];
  city?: string;
  bounds?: GeoBounds;
  authorId?: Id;
  createdAfter?: IsoDateTime;
}

/** F2.6 periodic action limits, counted over a rolling 24 h window. */
export interface ActionQuota {
  reportsRemaining: number;
  votesRemaining: number;
  /** When a new report becomes possible again; null while some remain. */
  reportsAvailableAt: IsoDateTime | null;
  /** When a new vote becomes possible again; null while some remain. */
  votesAvailableAt: IsoDateTime | null;
}

export interface CreateReportInput {
  authorId: Id;
  /** `draft.city` is recomputed from the position (nearest pilot city, F2.3 zone). */
  draft: ReportDraft;
  /** OFFLINE_SYNCED when replayed from the local queue (M3). Idempotent on `draft.clientId`. */
  origin: ReportOrigin;
}

export interface VoteInput {
  reportId: Id;
  userId: Id;
  verdict: Verdict;
}

export interface ReportRepository {
  getActionQuota(userId: Id): Promise<ActionQuota>;
  create(input: CreateReportInput): Promise<Report>;
  /** Most recent first. Without `statuses`, every status is returned. */
  list(filters?: ReportFilters): Promise<Report[]>;
  getById(reportId: Id): Promise<Report>;
  getUserVote(reportId: Id, userId: Id): Promise<Verdict | null>;
  /** F2.4 consensus; may move the report to VALIDATED, INVALIDATED or SUSPICIOUS. */
  vote(input: VoteInput): Promise<Report>;
  /** F9.7 "pris en charge" by an Authority. */
  markHandled(input: { reportId: Id; authorityId: Id }): Promise<Report>;
  close(input: { reportId: Id; actorId: Id }): Promise<Report>;
}

export interface ResolveModerationInput {
  itemId: Id;
  adminId: Id;
  decision: string;
}

export interface ModerationRepository {
  listOpen(): Promise<ModerationItem[]>;
  resolve(input: ResolveModerationInput): Promise<ModerationItem>;
}
