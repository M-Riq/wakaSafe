import type {
  ModerationRepository,
  NotificationRepository,
  PointsRepository,
  QuizRepository,
  RatingRepository,
  ReportRepository,
  StatsRepository,
} from '@wakasafe/data-contracts';

import { notImplemented as todo } from '../utils';

// Repositories delivered in later phases. The seed already contains their data, so the
// implementations only have to read and update it. Each call rejects with NOT_IMPLEMENTED.

export function createReportRepository(): ReportRepository {
  return {
    getActionQuota: () => todo('reports.getActionQuota', 3),
    create: () => todo('reports.create', 3),
    list: () => todo('reports.list', 3),
    getById: () => todo('reports.getById', 3),
    getUserVote: () => todo('reports.getUserVote', 3),
    vote: () => todo('reports.vote', 3),
    markHandled: () => todo('reports.markHandled', 9),
    close: () => todo('reports.close', 8),
  };
}

export function createModerationRepository(): ModerationRepository {
  return {
    listOpen: () => todo('moderation.listOpen', 8),
    resolve: () => todo('moderation.resolve', 8),
  };
}

export function createQuizRepository(): QuizRepository {
  return {
    getDailyQuestions: () => todo('quiz.getDailyQuestions', 5),
    answer: () => todo('quiz.answer', 5),
    listQuizzes: () => todo('quiz.listQuizzes', 9),
    getQuestions: () => todo('quiz.getQuestions', 9),
    upsertQuiz: () => todo('quiz.upsertQuiz', 9),
    setActive: () => todo('quiz.setActive', 9),
  };
}

export function createPointsRepository(): PointsRepository {
  return {
    listEntries: () => todo('points.listEntries', 5),
    getScore: () => todo('points.getScore', 5),
    getLeaderboard: () => todo('points.getLeaderboard', 5),
  };
}

export function createRatingRepository(): RatingRepository {
  return {
    getRatingEligibility: () => todo('ratings.getRatingEligibility', 6),
    submit: () => todo('ratings.submit', 6),
    listDrivers: () => todo('ratings.listDrivers', 6),
    listAgencies: () => todo('ratings.listAgencies', 6),
    getDriverStats: () => todo('ratings.getDriverStats', 6),
  };
}

export function createNotificationRepository(): NotificationRepository {
  return {
    list: () => todo('notifications.list', 7),
    countUnread: () => todo('notifications.countUnread', 7),
    markAsRead: () => todo('notifications.markAsRead', 7),
    markAllAsRead: () => todo('notifications.markAllAsRead', 7),
    push: () => todo('notifications.push', 7),
  };
}

export function createStatsRepository(): StatsRepository {
  return {
    getKpis: () => todo('stats.getKpis', 9),
    getHeatmap: () => todo('stats.getHeatmap', 9),
    exportRows: () => todo('stats.exportRows', 9),
  };
}
