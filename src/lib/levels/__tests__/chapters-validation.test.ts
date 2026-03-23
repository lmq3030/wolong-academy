import { describe, it, expect } from 'vitest';
import { chapters } from '../chapters';
import type { Chapter, Challenge } from '../types';

/**
 * Comprehensive validation of ALL 16 chapter data files (chapter-00 through chapter-15).
 *
 * These tests validate structural invariants that the Zod schema alone cannot
 * fully enforce, catching data-entry bugs that have caused runtime issues.
 */

const chapterIds = Object.keys(chapters).sort();
const allChapters = Object.values(chapters);

describe('Chapter data — structural completeness', () => {
  it('there are exactly 16 chapters', () => {
    expect(chapterIds).toHaveLength(16);
  });

  it('chapter IDs follow the pattern chapter-XX (00 through 15)', () => {
    for (let i = 0; i < 16; i++) {
      const expectedId = `chapter-${String(i).padStart(2, '0')}`;
      expect(chapterIds).toContain(expectedId);
    }
  });

  it('each chapter ID matches its key in the chapters record', () => {
    for (const [key, chapter] of Object.entries(chapters)) {
      expect(chapter.id).toBe(key);
    }
  });

  it('all acts are valid (1-4)', () => {
    for (const ch of allChapters) {
      expect([1, 2, 3, 4]).toContain(ch.act);
    }
  });

  it('all 4 acts are represented across the 16 chapters', () => {
    const acts = new Set(allChapters.map((ch) => ch.act));
    expect(acts.size).toBe(4);
    expect(acts).toContain(1);
    expect(acts).toContain(2);
    expect(acts).toContain(3);
    expect(acts).toContain(4);
  });
});

describe('Chapter data — challenge counts and qi rewards', () => {
  it.each(chapterIds)('%s has exactly 3 challenges', (chapterId) => {
    const chapter = chapters[chapterId];
    expect(
      chapter.challenges.length,
      `${chapterId} has ${chapter.challenges.length} challenges, expected 3`,
    ).toBe(3);
  });

  it.each(chapterIds)('%s qiReward sums to exactly 100', (chapterId) => {
    const chapter = chapters[chapterId];
    const totalQi = chapter.challenges.reduce((sum, c) => sum + c.qiReward, 0);
    expect(
      totalQi,
      `${chapterId} qiReward sums to ${totalQi}, expected 100`,
    ).toBe(100);
  });

  it('all individual qiReward values are positive integers', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        expect(c.qiReward).toBeGreaterThan(0);
        expect(Number.isInteger(c.qiReward)).toBe(true);
      }
    }
  });
});

describe('Chapter data — hints', () => {
  it.each(chapterIds)('%s: every challenge has exactly 3 hints', (chapterId) => {
    const chapter = chapters[chapterId];
    for (const c of chapter.challenges) {
      expect(
        c.hints.length,
        `${chapterId} / ${c.id}: has ${c.hints.length} hints, expected 3`,
      ).toBe(3);
    }
  });

  it('all hints are non-empty strings', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        for (let i = 0; i < c.hints.length; i++) {
          expect(
            c.hints[i].length,
            `${ch.id} / ${c.id}: hint[${i}] is empty`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe('Chapter data — fill_blank challenges', () => {
  const fillBlankChallenges: { chapterId: string; challenge: Challenge }[] = [];
  for (const ch of allChapters) {
    for (const c of ch.challenges) {
      if (c.type === 'fill_blank') {
        fillBlankChallenges.push({ chapterId: ch.id, challenge: c });
      }
    }
  }

  it('at least one fill_blank challenge exists across all chapters', () => {
    expect(fillBlankChallenges.length).toBeGreaterThan(0);
  });

  it('every fill_blank challenge has a codeTemplate containing ___', () => {
    for (const { chapterId, challenge: c } of fillBlankChallenges) {
      expect(
        c.codeTemplate,
        `${chapterId} / ${c.id}: fill_blank missing codeTemplate`,
      ).toBeDefined();
      expect(
        c.codeTemplate!.includes('___'),
        `${chapterId} / ${c.id}: codeTemplate does not contain ___`,
      ).toBe(true);
    }
  });

  it('every fill_blank challenge has a choices array with exactly 3 options', () => {
    for (const { chapterId, challenge: c } of fillBlankChallenges) {
      expect(
        c.choices,
        `${chapterId} / ${c.id}: fill_blank missing choices`,
      ).toBeDefined();
      expect(
        c.choices!.length,
        `${chapterId} / ${c.id}: choices has ${c.choices?.length} options, expected 3`,
      ).toBe(3);
    }
  });

  it('fill_blank choices contain non-empty strings', () => {
    for (const { chapterId, challenge: c } of fillBlankChallenges) {
      for (let i = 0; i < (c.choices?.length ?? 0); i++) {
        expect(
          c.choices![i].length,
          `${chapterId} / ${c.id}: choices[${i}] is empty`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe('Chapter data — drag challenges', () => {
  const dragChallenges: { chapterId: string; challenge: Challenge }[] = [];
  for (const ch of allChapters) {
    for (const c of ch.challenges) {
      if (c.type === 'drag') {
        dragChallenges.push({ chapterId: ch.id, challenge: c });
      }
    }
  }

  it('at least one drag challenge exists across all chapters', () => {
    expect(dragChallenges.length).toBeGreaterThan(0);
  });

  it('every drag challenge has dragOptions with at least one isCorrect option', () => {
    for (const { chapterId, challenge: c } of dragChallenges) {
      expect(
        c.dragOptions,
        `${chapterId} / ${c.id}: drag missing dragOptions`,
      ).toBeDefined();
      expect(
        c.dragOptions!.length,
        `${chapterId} / ${c.id}: dragOptions is empty`,
      ).toBeGreaterThan(0);

      const correctCount = c.dragOptions!.filter((o) => o.isCorrect).length;
      expect(
        correctCount,
        `${chapterId} / ${c.id}: dragOptions has 0 correct options`,
      ).toBeGreaterThanOrEqual(1);
    }
  });

  it('drag options have unique IDs within each challenge', () => {
    for (const { chapterId, challenge: c } of dragChallenges) {
      const ids = c.dragOptions!.map((o) => o.id);
      const uniqueIds = new Set(ids);
      expect(
        uniqueIds.size,
        `${chapterId} / ${c.id}: duplicate dragOption IDs`,
      ).toBe(ids.length);
    }
  });

  it('when multiple correct drag options exist, each has a distinct slot', () => {
    for (const { chapterId, challenge: c } of dragChallenges) {
      const correctOptions = c.dragOptions!.filter((o) => o.isCorrect);
      if (correctOptions.length > 1) {
        // Multi-block drag: each correct option MUST have a slot for ordering
        const slots: number[] = [];
        for (const opt of correctOptions) {
          expect(
            opt.slot,
            `${chapterId} / ${c.id}: multi-block correct option ${opt.id} missing slot`,
          ).toBeDefined();
          expect(opt.slot).toBeGreaterThanOrEqual(0);
          expect(
            slots,
            `${chapterId} / ${c.id}: duplicate slot ${opt.slot}`,
          ).not.toContain(opt.slot);
          slots.push(opt.slot!);
        }
      }
    }
  });

  it('correct drag options with slot have non-negative slot values', () => {
    for (const { chapterId, challenge: c } of dragChallenges) {
      const correctOptions = c.dragOptions!.filter((o) => o.isCorrect);
      for (const opt of correctOptions) {
        if (opt.slot !== undefined) {
          expect(
            opt.slot,
            `${chapterId} / ${c.id}: option ${opt.id} has negative slot`,
          ).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});

describe('Chapter data — free_code challenges', () => {
  const freeCodeChallenges: { chapterId: string; challenge: Challenge }[] = [];
  for (const ch of allChapters) {
    for (const c of ch.challenges) {
      if (c.type === 'free_code') {
        freeCodeChallenges.push({ chapterId: ch.id, challenge: c });
      }
    }
  }

  it('at least one free_code challenge exists across all chapters', () => {
    expect(freeCodeChallenges.length).toBeGreaterThan(0);
  });

  it('every free_code challenge has a non-empty correctAnswer', () => {
    for (const { chapterId, challenge: c } of freeCodeChallenges) {
      expect(
        c.correctAnswer,
        `${chapterId} / ${c.id}: free_code missing correctAnswer`,
      ).toBeDefined();
      expect(
        c.correctAnswer.length,
        `${chapterId} / ${c.id}: correctAnswer is empty`,
      ).toBeGreaterThan(0);
    }
  });
});

describe('Chapter data — testCases', () => {
  it('every challenge has at least one testCase', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        expect(
          c.testCases.length,
          `${ch.id} / ${c.id}: has 0 testCases`,
        ).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('all testCases with output end with \\n (empty expectedOutput allowed for no-output challenges)', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        for (let i = 0; i < c.testCases.length; i++) {
          const tc = c.testCases[i];
          // Empty expectedOutput is valid for "no output" challenges (e.g. variable assignment)
          if (tc.expectedOutput.length > 0) {
            expect(
              tc.expectedOutput.endsWith('\n'),
              `${ch.id} / ${c.id} testCase[${i}] expectedOutput does not end with \\n: "${tc.expectedOutput}"`,
            ).toBe(true);
          }
        }
      }
    }
  });

  it('all testCases have a non-empty description', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        for (const tc of c.testCases) {
          expect(
            tc.description.length,
            `${ch.id} / ${c.id}: testCase description is empty`,
          ).toBeGreaterThan(0);
        }
      }
    }
  });

  it('all testCases have expectedOutput defined (can be empty for no-output challenges)', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        for (const tc of c.testCases) {
          expect(
            tc.expectedOutput,
            `${ch.id} / ${c.id}: testCase expectedOutput is undefined`,
          ).toBeDefined();
        }
      }
    }
  });
});

describe('Chapter data — battle config', () => {
  it.each(chapterIds)('%s has a valid battle config', (chapterId) => {
    const chapter = chapters[chapterId];
    const { battle } = chapter;

    expect(battle).toBeDefined();
    expect(battle.playerGeneral.length).toBeGreaterThan(0);
    expect(battle.playerSkill.length).toBeGreaterThan(0);
    expect(battle.bgScene.length).toBeGreaterThan(0);
  });

  it('battle bgScene paths start with /', () => {
    for (const ch of allChapters) {
      expect(
        ch.battle.bgScene.startsWith('/'),
        `${ch.id}: bgScene "${ch.battle.bgScene}" does not start with /`,
      ).toBe(true);
    }
  });
});

describe('Chapter data — required string fields are non-empty', () => {
  it.each(chapterIds)('%s has non-empty title, storyIntro, pythonConcept', (chapterId) => {
    const chapter = chapters[chapterId];
    expect(chapter.title.length).toBeGreaterThan(0);
    expect(chapter.storyIntro.length).toBeGreaterThan(0);
    expect(chapter.pythonConcept.length).toBeGreaterThan(0);
  });

  it('all challenge IDs are non-empty and unique globally', () => {
    const allIds: string[] = [];
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        expect(c.id.length).toBeGreaterThan(0);
        allIds.push(c.id);
      }
    }
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('all challenges have a non-empty prompt', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        expect(
          c.prompt.length,
          `${ch.id} / ${c.id}: prompt is empty`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it('all challenges have a non-empty correctAnswer', () => {
    for (const ch of allChapters) {
      for (const c of ch.challenges) {
        expect(
          c.correctAnswer.length,
          `${ch.id} / ${c.id}: correctAnswer is empty`,
        ).toBeGreaterThan(0);
      }
    }
  });
});

describe('Chapter data — difficulty and ordering', () => {
  it('difficulty values are valid (1-5)', () => {
    for (const ch of allChapters) {
      expect(ch.difficulty).toBeGreaterThanOrEqual(1);
      expect(ch.difficulty).toBeLessThanOrEqual(5);
    }
  });

  it('chapters within each act are in non-decreasing difficulty', () => {
    const actChapters: Record<number, Chapter[]> = {};
    for (const ch of allChapters) {
      if (!actChapters[ch.act]) actChapters[ch.act] = [];
      actChapters[ch.act].push(ch);
    }

    for (const [act, chs] of Object.entries(actChapters)) {
      // Sort by chapter ID to get intended order
      const sorted = [...chs].sort((a, b) => a.id.localeCompare(b.id));
      for (let i = 1; i < sorted.length; i++) {
        expect(
          sorted[i].difficulty,
          `Act ${act}: ${sorted[i].id} (difficulty ${sorted[i].difficulty}) is easier than ${sorted[i - 1].id} (difficulty ${sorted[i - 1].difficulty})`,
        ).toBeGreaterThanOrEqual(sorted[i - 1].difficulty);
      }
    }
  });

  it('interactionMode values are valid', () => {
    const validModes = new Set(['drag', 'fill', 'code', 'mixed']);
    for (const ch of allChapters) {
      expect(
        validModes.has(ch.interactionMode),
        `${ch.id}: interactionMode "${ch.interactionMode}" is not valid`,
      ).toBe(true);
    }
  });
});
