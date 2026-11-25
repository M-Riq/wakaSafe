import type {
  Attempt,
  Id,
  LeaderboardEntry,
  LeaderboardPeriod,
  PointEntry,
  PublicQuestion,
  Question,
  Quiz,
} from '@wakasafe/domain';

// M5 quiz, points and leaderboards.

/** F5.2 — at most 5 questions per day and per user. */
export interface DailyQuiz {
  /** "YYYY-MM-DD", Africa/Douala. */
  localDay: string;
  limit: number;
  answeredToday: number;
  /** Next questions to answer today (empty when the limit is reached). */
  questions: PublicQuestion[];
}

/** F5.1 — pedagogical correction returned right after answering. */
export interface AnswerResult {
  attempt: Attempt;
  correctChoiceId: Id;
  explanation: string;
  pointsAwarded: number;
  remainingToday: number;
}

export interface AnswerInput {
  userId: Id;
  questionId: Id;
  choiceId: Id;
}

export type QuestionUpsert = Omit<Question, 'id' | 'quizId'> & { id?: Id };

export interface QuizUpsert {
  quiz: Omit<Quiz, 'id' | 'createdAt'> & { id?: Id };
  questions: QuestionUpsert[];
}

export interface QuizRepository {
  getDailyQuestions(userId: Id): Promise<DailyQuiz>;
  answer(input: AnswerInput): Promise<AnswerResult>;
  /** F9.4 administration. */
  listQuizzes(): Promise<Quiz[]>;
  getQuestions(quizId: Id): Promise<Question[]>;
  upsertQuiz(input: QuizUpsert): Promise<Quiz>;
  setActive(quizId: Id, isActive: boolean): Promise<Quiz>;
}

/** F5.5 — score, progression and rank. */
export interface UserScore {
  userId: Id;
  totalPoints: number;
  monthlyPoints: number;
  annualPoints: number;
  monthlyRank: number | null;
  annualRank: number | null;
  monthKey: string;
  yearKey: string;
}

export interface LeaderboardRow extends LeaderboardEntry {
  /** Public display name (first name and last-name initial). */
  displayName: string;
}

export interface LeaderboardQuery {
  period: LeaderboardPeriod;
  /** Defaults to the current month or year. */
  periodKey?: string;
  limit?: number;
}

export interface PointsRepository {
  /** F5.3 dated and traceable history, newest first. */
  listEntries(userId: Id): Promise<PointEntry[]>;
  getScore(userId: Id): Promise<UserScore>;
  getLeaderboard(query: LeaderboardQuery): Promise<LeaderboardRow[]>;
}
