import {
  BUSINESS_RULES,
  localDayKey,
  ratingPeriodKey,
  type Attempt,
  type Driver,
  type Notification,
  type PointEntry,
  type Question,
  type Rating,
} from '@wakasafe/domain';

import { DEMO_USER_IDS } from '../demo-accounts';
import { addMinutes, type Timeline } from './timeline';

interface AttemptSessionSpec {
  userId: string;
  daysAgo: number;
  quizId: string;
  /** Indexes (0-based) of the questions answered wrongly. */
  wrong: number[];
  count: number;
}

const ATTEMPT_SESSIONS: AttemptSessionSpec[] = [
  { userId: DEMO_USER_IDS.citizen, daysAgo: 1, quizId: 'quiz-traffic-code', count: 5, wrong: [3] },
  { userId: DEMO_USER_IDS.citizen, daysAgo: 3, quizId: 'quiz-good-reflexes', count: 3, wrong: [] },
  { userId: 'user-101', daysAgo: 2, quizId: 'quiz-first-aid', count: 5, wrong: [] },
  { userId: 'user-102', daysAgo: 1, quizId: 'quiz-specific-dangers', count: 5, wrong: [1, 4] },
  { userId: 'user-104', daysAgo: 5, quizId: 'quiz-traffic-code', count: 2, wrong: [] },
  { userId: DEMO_USER_IDS.driver, daysAgo: 4, quizId: 'quiz-good-reflexes', count: 5, wrong: [2] },
  { userId: 'user-111', daysAgo: 35, quizId: 'quiz-first-aid', count: 5, wrong: [] },
  { userId: 'user-112', daysAgo: 6, quizId: 'quiz-traffic-code', count: 4, wrong: [0] },
];

interface RatingSpec {
  passengerId: string;
  driverId: string;
  daysAgo: number;
  scores: [number, number, number, number];
}

const RATINGS: RatingSpec[] = [
  { passengerId: DEMO_USER_IDS.citizen, driverId: 'user-108', daysAgo: 3, scores: [5, 5, 4, 5] },
  { passengerId: 'user-101', driverId: 'user-108', daysAgo: 10, scores: [4, 4, 5, 4] },
  { passengerId: 'user-111', driverId: 'user-108', daysAgo: 2, scores: [4, 3, 4, 4] },
  { passengerId: 'user-102', driverId: DEMO_USER_IDS.driver, daysAgo: 1, scores: [5, 4, 5, 4] },
  { passengerId: 'user-103', driverId: DEMO_USER_IDS.driver, daysAgo: 6, scores: [4, 5, 4, 3] },
  { passengerId: 'user-112', driverId: DEMO_USER_IDS.driver, daysAgo: 12, scores: [3, 4, 4, 4] },
  {
    passengerId: DEMO_USER_IDS.citizen,
    driverId: DEMO_USER_IDS.driver,
    daysAgo: 20,
    scores: [4, 4, 4, 5],
  },
  { passengerId: 'user-107', driverId: 'user-110', daysAgo: 4, scores: [3, 2, 3, 3] },
  { passengerId: 'user-102', driverId: 'user-110', daysAgo: 40, scores: [2, 3, 2, 3] },
  { passengerId: 'user-104', driverId: 'user-109', daysAgo: 2, scores: [5, 5, 5, 4] },
  { passengerId: 'user-106', driverId: 'user-109', daysAgo: 8, scores: [4, 4, 5, 5] },
  {
    passengerId: DEMO_USER_IDS.pendingDriver,
    driverId: 'user-109',
    daysAgo: 15,
    scores: [4, 3, 4, 4],
  },
];

export interface SeedActivity {
  attempts: Attempt[];
  ratings: Rating[];
  notifications: Notification[];
  pointEntries: PointEntry[];
}

export function seedActivity(t: Timeline, questions: Question[], drivers: Driver[]): SeedActivity {
  const attempts: Attempt[] = [];
  const pointEntries: PointEntry[] = [];

  ATTEMPT_SESSIONS.forEach((session) => {
    const quizQuestions = questions.filter((q) => q.quizId === session.quizId);
    const start = t.daysAgo(session.daysAgo);
    quizQuestions.slice(0, session.count).forEach((question, index) => {
      const isCorrect = !session.wrong.includes(index);
      const choiceId = isCorrect
        ? question.correctChoiceId
        : question.choices.find((c) => c.id !== question.correctChoiceId)!.id;
      const answeredAt = addMinutes(start, index);
      const attempt: Attempt = {
        id: `attempt-${session.userId}-${question.id}-${session.daysAgo}`,
        userId: session.userId,
        questionId: question.id,
        choiceId,
        isCorrect,
        localDay: localDayKey(new Date(answeredAt)),
        answeredAt,
      };
      attempts.push(attempt);
      if (isCorrect) {
        pointEntries.push({
          id: `points-${attempt.id}`,
          userId: session.userId,
          reason: 'QUIZ_CORRECT_ANSWER',
          points: BUSINESS_RULES.points.QUIZ_CORRECT_ANSWER,
          sourceType: 'QUIZ_ATTEMPT',
          sourceId: attempt.id,
          createdAt: answeredAt,
        });
      }
    });
  });

  const ratings: Rating[] = RATINGS.map((spec, index) => {
    const createdAt = t.daysAgo(spec.daysAgo);
    const driver = drivers.find((d) => d.userId === spec.driverId)!;
    const [courtesy, punctuality, safeDriving, vehicleCleanliness] = spec.scores;
    return {
      id: `rating-${index + 1}`,
      passengerId: spec.passengerId,
      driverId: spec.driverId,
      agencyId: driver.agencyId,
      courtesy,
      punctuality,
      safeDriving,
      vehicleCleanliness,
      periodKey: ratingPeriodKey(new Date(createdAt)),
      createdAt,
    };
  });
  ratings.forEach((rating) => {
    pointEntries.push({
      id: `points-${rating.id}`,
      userId: rating.passengerId,
      reason: 'RATING_SUBMITTED',
      points: BUSINESS_RULES.points.RATING_SUBMITTED,
      sourceType: 'RATING',
      sourceId: rating.id,
      createdAt: rating.createdAt,
    });
  });

  const notifications: Notification[] = [
    {
      id: 'notification-1',
      userId: DEMO_USER_IDS.citizen,
      type: 'NEARBY_DANGER',
      title: 'Danger signalé près de vous',
      body: 'Accident ou situation critique signalé au carrefour Bastos, Yaoundé.',
      data: { reportId: 'report-03' },
      createdAt: t.hoursAgo(2),
      readAt: null,
    },
    {
      id: 'notification-2',
      userId: DEMO_USER_IDS.citizen,
      type: 'QUIZ_REMINDER',
      title: 'Vos questions du jour vous attendent',
      body: 'Répondez à 5 questions de sécurité routière et gagnez des points.',
      data: null,
      createdAt: t.hoursAgo(9),
      readAt: null,
    },
    {
      id: 'notification-3',
      userId: DEMO_USER_IDS.citizen,
      type: 'AUTHORITY_INFO',
      title: 'Signalement pris en charge',
      body: 'Les autorités ont pris en charge votre signalement de travaux mal balisés à Mokolo.',
      data: { reportId: 'report-04' },
      createdAt: t.hoursAgo(20),
      readAt: t.hoursAgo(18),
    },
    {
      id: 'notification-4',
      userId: DEMO_USER_IDS.driver,
      type: 'NEARBY_DANGER',
      title: 'Danger signalé près de vous',
      body: 'Accident signalé à Ndokoti, Douala. Prudence.',
      data: { reportId: 'report-13' },
      createdAt: t.hoursAgo(3),
      readAt: null,
    },
    {
      id: 'notification-5',
      userId: DEMO_USER_IDS.driver,
      type: 'PROFILE_DECISION',
      title: 'Profil Conducteur validé',
      body: 'Votre profil Conducteur d’agence (Wouri Démo Express) a été validé.',
      data: { profileRequestId: 'request-driver' },
      createdAt: t.daysAgo(68),
      readAt: t.daysAgo(68),
    },
    {
      id: 'notification-6',
      userId: DEMO_USER_IDS.pendingDriver,
      type: 'QUIZ_REMINDER',
      title: 'Vos questions du jour vous attendent',
      body: 'Répondez à 5 questions de sécurité routière et gagnez des points.',
      data: null,
      createdAt: t.hoursAgo(9),
      readAt: null,
    },
    {
      id: 'notification-7',
      userId: 'user-106',
      type: 'PROFILE_DECISION',
      title: 'Demande de profil Conducteur refusée',
      body: 'Permis de conduire illisible. Vous pouvez soumettre une nouvelle demande.',
      data: { profileRequestId: 'request-106' },
      createdAt: t.daysAgo(4),
      readAt: null,
    },
    {
      id: 'notification-8',
      userId: DEMO_USER_IDS.suspended,
      type: 'ACCOUNT_SANCTION',
      title: 'Compte suspendu temporairement',
      body: 'Suite à des abus répétés, votre compte est en lecture seule pendant 72 heures.',
      data: null,
      createdAt: t.hoursAgo(24),
      readAt: null,
    },
    {
      id: 'notification-9',
      userId: DEMO_USER_IDS.authority,
      type: 'NEARBY_DANGER',
      title: 'Danger critique signalé',
      body: 'Personne en détresse signalée à Ngoa-Ekellé, Yaoundé.',
      data: { reportId: 'report-08' },
      createdAt: t.hoursAgo(1),
      readAt: null,
    },
  ];

  return { attempts, ratings, notifications, pointEntries };
}
