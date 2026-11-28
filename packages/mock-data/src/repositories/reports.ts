import type { ActionQuota, ReportFilters, ReportRepository } from '@wakasafe/data-contracts';
import {
  automaticSuspensionEnd,
  BUSINESS_RULES,
  DomainError,
  isAbnormalReportFrequency,
  isAccountSuspended,
  isOpenToVotes,
  nearestPilotCity,
  ReportDraftSchema,
  reportQuota,
  statusAfterVote,
  validateInput,
  VerdictSchema,
  voteQuota,
  type Report,
  type User,
} from '@wakasafe/domain';

import type { MockDatabase } from '../schema';
import { clone, newId, notFound, notImplemented } from '../utils';
import type { MockContext } from './context';

function matches(report: Report, filters: ReportFilters): boolean {
  const { categories, severities, statuses, city, bounds, authorId, createdAfter } = filters;
  const { latitude, longitude } = report.location;
  return (
    (!categories?.length || categories.includes(report.category)) &&
    (!severities?.length || severities.includes(report.severity)) &&
    (!statuses?.length || statuses.includes(report.status)) &&
    (!city || report.city === city) &&
    (!authorId || report.authorId === authorId) &&
    (!createdAfter || report.createdAt > createdAfter) &&
    (!bounds ||
      (latitude <= bounds.north &&
        latitude >= bounds.south &&
        longitude <= bounds.east &&
        longitude >= bounds.west))
  );
}

/** A client user allowed to act now (F2.6 suspension, administrators use the back-office). */
function requireActiveClientUser(state: MockDatabase, userId: string, now: Date): User {
  const user = state.users.find((u) => u.id === userId);
  if (!user) throw notFound('User', userId);
  if (isAccountSuspended(user, now)) {
    throw new DomainError('ACCOUNT_SUSPENDED', 'Suspended accounts cannot act on reports');
  }
  if (user.role === 'ADMIN') {
    throw new DomainError('FORBIDDEN', 'Administrators use the back-office');
  }
  return user;
}

const authorReportTimes = (state: MockDatabase, userId: string) =>
  state.reports.filter((r) => r.authorId === userId).map((r) => r.createdAt);

const userVoteTimes = (state: MockDatabase, userId: string) =>
  state.reportValidations.filter((v) => v.userId === userId).map((v) => v.createdAt);

/** Abuse alerts of an author (F2.6): their reports flagged for abnormal frequency. */
function abuseAlertTimes(state: MockDatabase, userId: string): string[] {
  const own = new Set(state.reports.filter((r) => r.authorId === userId).map((r) => r.id));
  return state.moderationItems
    .filter((m) => m.reason === 'ABNORMAL_FREQUENCY' && own.has(m.targetId))
    .map((m) => m.createdAt);
}

function suspendAutomatically(state: MockDatabase, user: User, now: Date, until: string) {
  const at = now.toISOString();
  const hours = BUSINESS_RULES.sanctions.automaticSuspensionHours;
  user.status = 'SUSPENDED';
  user.suspendedUntil = until;
  state.sanctions.push({
    id: newId('sanction'),
    userId: user.id,
    reason: `Signalements anormalement fréquents à répétition\u00A0: suspension automatique de ${hours} h.`,
    startsAt: at,
    endsAt: until,
    createdBy: null,
  });
  state.moderationItems.push({
    id: newId('moderation'),
    targetType: 'ACCOUNT',
    targetId: user.id,
    reason: 'ACTION_LIMIT_ABUSE',
    status: 'RESOLVED',
    createdAt: at,
    resolvedBy: null,
    resolvedAt: at,
    decision: `Suspension automatique de ${hours} h.`,
  });
}

export function createReportRepository({ db, clock, wait }: MockContext): ReportRepository {
  return {
    async getActionQuota(userId): Promise<ActionQuota> {
      await wait();
      const state = await db.read();
      if (!state.users.some((u) => u.id === userId)) throw notFound('User', userId);
      const now = clock.now();
      const reports = reportQuota(authorReportTimes(state, userId), now);
      const votes = voteQuota(userVoteTimes(state, userId), now);
      return {
        reportsRemaining: reports.remaining,
        votesRemaining: votes.remaining,
        reportsAvailableAt: reports.availableAt,
        votesAvailableAt: votes.availableAt,
      };
    },

    async create({ authorId, draft, origin }) {
      await wait();
      const valid = validateInput(ReportDraftSchema, draft);
      return db.update((state) => {
        const now = clock.now();
        const at = now.toISOString();
        // Idempotent replay of the offline queue (M3): the report already exists.
        const existing = state.reports.find(
          (r) => r.authorId === authorId && r.clientId === valid.clientId,
        );
        if (existing) return clone(existing);

        const author = requireActiveClientUser(state, authorId, now);
        const previous = authorReportTimes(state, authorId);
        const quota = reportQuota(previous, now);
        if (quota.remaining === 0) {
          throw new DomainError('QUOTA_EXCEEDED', 'Report quota reached', {
            reason: 'REPORT_QUOTA_REACHED',
            availableAt: quota.availableAt,
          });
        }

        const abnormal = isAbnormalReportFrequency([...previous, at], now);
        const report: Report = {
          ...valid,
          city: nearestPilotCity(valid.location),
          id: newId('report'),
          authorId,
          createdAt: at,
          status: abnormal ? 'SUSPICIOUS' : 'CREATED',
          origin,
          confirmations: 0,
          refutations: 0,
          validatedAt: null,
          handledBy: null,
          handledAt: null,
          closedAt: null,
        };
        state.reports.push(report);

        if (abnormal) {
          state.moderationItems.push({
            id: newId('moderation'),
            targetType: 'REPORT',
            targetId: report.id,
            reason: 'ABNORMAL_FREQUENCY',
            status: 'OPEN',
            createdAt: at,
            resolvedBy: null,
            resolvedAt: null,
            decision: null,
          });
          const until = automaticSuspensionEnd(abuseAlertTimes(state, authorId), now);
          if (until) suspendAutomatically(state, author, now, until);
        }
        return clone(report);
      });
    },

    async list(filters = {}) {
      await wait();
      const reports = (await db.read()).reports
        .filter((r) => matches(r, filters))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return clone(reports);
    },

    async getById(reportId) {
      await wait();
      const report = (await db.read()).reports.find((r) => r.id === reportId);
      if (!report) throw notFound('Report', reportId);
      return clone(report);
    },

    async getUserVote(reportId, userId) {
      await wait();
      const vote = (await db.read()).reportValidations.find(
        (v) => v.reportId === reportId && v.userId === userId,
      );
      return vote?.verdict ?? null;
    },

    async vote({ reportId, userId, verdict: rawVerdict }) {
      await wait();
      const verdict = validateInput(VerdictSchema, rawVerdict);
      return db.update((state) => {
        const now = clock.now();
        const at = now.toISOString();
        const report = state.reports.find((r) => r.id === reportId);
        if (!report) throw notFound('Report', reportId);
        requireActiveClientUser(state, userId, now);
        if (report.authorId === userId) {
          throw new DomainError('FORBIDDEN', 'Authors cannot vote on their own report', {
            reason: 'OWN_REPORT',
          });
        }
        if (state.reportValidations.some((v) => v.reportId === reportId && v.userId === userId)) {
          throw new DomainError('ALREADY_VOTED', 'One vote per user and report');
        }
        if (!isOpenToVotes(report.status)) {
          throw new DomainError('CONFLICT', `Report ${report.status} is closed to votes`, {
            reason: 'REPORT_CLOSED_TO_VOTES',
          });
        }
        const quota = voteQuota(userVoteTimes(state, userId), now);
        if (quota.remaining === 0) {
          throw new DomainError('QUOTA_EXCEEDED', 'Vote quota reached', {
            reason: 'VOTE_QUOTA_REACHED',
            availableAt: quota.availableAt,
          });
        }

        state.reportValidations.push({
          id: newId('validation'),
          reportId,
          userId,
          verdict,
          createdAt: at,
        });
        if (verdict === 'CONFIRM') report.confirmations += 1;
        else report.refutations += 1;

        const validatedAt = report.validatedAt;
        const refutationsSinceValidation = validatedAt
          ? state.reportValidations.filter(
              (v) => v.reportId === reportId && v.verdict === 'REFUTE' && v.createdAt > validatedAt,
            ).length
          : 0;
        const next = statusAfterVote(report.status, {
          confirmations: report.confirmations,
          refutations: report.refutations,
          refutationsSinceValidation,
        });

        if (next === 'VALIDATED' && report.status !== 'VALIDATED') {
          report.validatedAt = at;
          // F5.3: points for the author (shown with the leaderboards).
          state.pointEntries.push({
            id: newId('points'),
            userId: report.authorId,
            reason: 'REPORT_VALIDATED',
            points: BUSINESS_RULES.points.REPORT_VALIDATED,
            sourceType: 'REPORT',
            sourceId: report.id,
            createdAt: at,
          });
        }
        if (next === 'SUSPICIOUS' && report.status !== 'SUSPICIOUS') {
          state.moderationItems.push({
            id: newId('moderation'),
            targetType: 'REPORT',
            targetId: report.id,
            reason: 'MANY_REFUTATIONS',
            status: 'OPEN',
            createdAt: at,
            resolvedBy: null,
            resolvedAt: null,
            decision: null,
          });
        }
        report.status = next;
        return clone(report);
      });
    },

    markHandled: () => notImplemented('reports.markHandled', 9),
    close: () => notImplemented('reports.close', 8),
  };
}
