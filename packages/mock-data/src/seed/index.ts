import { MOCK_DATABASE_VERSION, type MockDatabase } from '../schema';
import { seedActivity } from './activity';
import { seedPeople } from './people';
import { seedQuizzes } from './quizzes';
import { seedReports } from './reports';
import { createTimeline } from './timeline';

/**
 * Deterministic demo dataset for Yaoundé, Douala and Bafoussam. All dates are relative
 * to `now`, so the demo always looks recent. Both applications start from this seed.
 */
export function createSeed(now: Date): MockDatabase {
  const t = createTimeline(now);
  const people = seedPeople(t);
  const reports = seedReports(t, people.users);
  const quiz = seedQuizzes(t);
  const activity = seedActivity(t, quiz.questions, people.drivers);

  return {
    version: MOCK_DATABASE_VERSION,
    seededAt: now.toISOString(),
    ...people,
    passwordResets: [],
    reports: reports.reports,
    reportValidations: reports.reportValidations,
    moderationItems: reports.moderationItems,
    quizzes: quiz.quizzes,
    questions: quiz.questions,
    attempts: activity.attempts,
    ratings: activity.ratings,
    notifications: activity.notifications,
    pointEntries: [...reports.pointEntries, ...activity.pointEntries].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    ),
  };
}
