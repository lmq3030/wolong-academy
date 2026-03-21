import { z } from 'zod';

const testCaseSchema = z.object({
  input: z.string().optional(),
  expectedOutput: z.string(),
  description: z.string(),
});

const dragOptionSchema = z.object({
  id: z.string(),
  code: z.string(),
  isCorrect: z.boolean(),
  slot: z.number().optional(),
});

const challengeSchema = z.object({
  id: z.string(),
  type: z.enum(['drag', 'fill_blank', 'multiple_choice', 'free_code']),
  prompt: z.string(),
  codeTemplate: z.string().optional(),
  correctAnswer: z.string(),
  testCases: z.array(testCaseSchema).min(1),
  hints: z.array(z.string()).min(1),
  qiReward: z.number().min(0).max(100),
  dragOptions: z.array(dragOptionSchema).optional(),
  choices: z.array(z.string()).optional(),
});

const battleConfigSchema = z.object({
  playerGeneral: z.string(),
  enemyGeneral: z.string().optional(),
  playerSkill: z.string(),
  bgScene: z.string(),
});

const chapterRewardsSchema = z.object({
  xp: z.number().min(0),
  unlockGenerals: z.array(z.string()).optional(),
  unlockItems: z.array(z.string()).optional(),
  quote: z.string().optional(),
});

const chapterSchema = z.object({
  id: z.string(),
  act: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  title: z.string(),
  storyIntro: z.string(),
  pythonConcept: z.string(),
  difficulty: z.union([
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(5),
  ]),
  interactionMode: z.enum(['drag', 'fill', 'code', 'mixed']),
  challenges: z.array(challengeSchema).min(1),
  battle: battleConfigSchema,
  rewards: chapterRewardsSchema,
});

export function validateChapter(data: unknown) {
  return chapterSchema.parse(data);
}

export interface ChapterValidationError {
  chapterId: string;
  error: unknown;
}

export function validateAllChapters(
  chapters: Record<string, unknown>
): ChapterValidationError[] {
  const errors: ChapterValidationError[] = [];
  for (const [id, chapter] of Object.entries(chapters)) {
    try {
      chapterSchema.parse(chapter);
    } catch (err) {
      errors.push({ chapterId: id, error: err });
    }
  }
  return errors;
}
