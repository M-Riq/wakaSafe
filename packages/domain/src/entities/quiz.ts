import { z } from 'zod';

import { IdSchema, IsoDateTimeSchema } from './common';

// M5 quiz (F5.1, F5.2).

export const QuizThemeSchema = z.enum([
  'TRAFFIC_CODE',
  'GOOD_REFLEXES',
  'FIRST_AID',
  'SPECIFIC_DANGERS',
]);
export type QuizTheme = z.infer<typeof QuizThemeSchema>;

export const QuizSchema = z.object({
  id: IdSchema,
  title: z.string().min(1),
  theme: QuizThemeSchema,
  isActive: z.boolean(),
  /** true until GOSAFE provides the official content. */
  isPlaceholderContent: z.boolean(),
  createdAt: IsoDateTimeSchema,
});
export type Quiz = z.infer<typeof QuizSchema>;

export const ChoiceSchema = z.object({
  id: IdSchema,
  label: z.string().min(1),
  position: z.number().int().nonnegative(),
});
export type Choice = z.infer<typeof ChoiceSchema>;

export const QuestionSchema = z
  .object({
    id: IdSchema,
    quizId: IdSchema,
    statement: z.string().min(1),
    choices: z.array(ChoiceSchema).min(2),
    correctChoiceId: IdSchema,
    /** Pedagogical correction shown after answering (F5.1). */
    explanation: z.string().min(1),
    position: z.number().int().nonnegative(),
  })
  .refine((q) => q.choices.some((c) => c.id === q.correctChoiceId), {
    message: 'correctChoiceId must reference one of the choices',
    path: ['correctChoiceId'],
  });
export type Question = z.infer<typeof QuestionSchema>;

/** A question as shown before answering: without the answer nor the explanation. */
export type PublicQuestion = Omit<Question, 'correctChoiceId' | 'explanation'>;

export function toPublicQuestion(question: Question): PublicQuestion {
  const { correctChoiceId: _correct, explanation: _explanation, ...rest } = question;
  return rest;
}

export const AttemptSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  questionId: IdSchema,
  choiceId: IdSchema,
  isCorrect: z.boolean(),
  /** "YYYY-MM-DD" in the Africa/Douala time zone (F5.2 daily limit). */
  localDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  answeredAt: IsoDateTimeSchema,
});
export type Attempt = z.infer<typeof AttemptSchema>;
