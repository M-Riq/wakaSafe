import type {
  AgencyRepository,
  AuthRepository,
  ProfileRequestRepository,
  UserRepository,
} from './accounts';
import type { NotificationRepository } from './notifications';
import type { PointsRepository, QuizRepository } from './quiz';
import type { RatingRepository } from './ratings';
import type { ModerationRepository, ReportRepository } from './reports';
import type { StatsRepository } from './stats';

export * from './accounts';
export * from './infrastructure';
export * from './notifications';
export * from './quiz';
export * from './ratings';
export * from './reports';
export * from './stats';

/**
 * Everything an application needs from the data layer. Each app builds one instance in
 * its composition root (`src/data`) and features only see these interfaces (ADR-0005).
 */
export interface Repositories {
  auth: AuthRepository;
  users: UserRepository;
  profileRequests: ProfileRequestRepository;
  agencies: AgencyRepository;
  reports: ReportRepository;
  moderation: ModerationRepository;
  quiz: QuizRepository;
  points: PointsRepository;
  ratings: RatingRepository;
  notifications: NotificationRepository;
  stats: StatsRepository;
}
