import { describe, it, expect } from 'vitest';
import { validateChapter, validateAllChapters } from '../validation';

// A valid chapter that satisfies the full Zod schema
function makeValidChapter(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ch-01',
    act: 1,
    title: 'Test Chapter',
    storyIntro: 'Once upon a time...',
    pythonConcept: 'print()',
    difficulty: 1,
    interactionMode: 'drag',
    challenges: [
      {
        id: 'c1',
        type: 'drag',
        prompt: 'Drag the correct block',
        correctAnswer: 'print("hello")',
        testCases: [
          { expectedOutput: 'hello', description: 'prints hello' },
        ],
        hints: ['Try print'],
        qiReward: 50,
        dragOptions: [
          { id: 'o1', code: 'print("hello")', isCorrect: true, slot: 0 },
        ],
      },
    ],
    battle: {
      playerGeneral: 'liubei',
      playerSkill: 'fireball',
      bgScene: '/bg.png',
    },
    rewards: {
      xp: 100,
      unlockGenerals: ['guanyu'],
    },
    ...overrides,
  };
}

describe('validateChapter', () => {
  it('accepts a valid chapter', () => {
    const chapter = makeValidChapter();
    const result = validateChapter(chapter);
    expect(result.id).toBe('ch-01');
    expect(result.title).toBe('Test Chapter');
  });

  it('rejects chapter with missing required field: id', () => {
    const chapter = makeValidChapter();
    delete (chapter as Record<string, unknown>).id;
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects chapter with missing required field: title', () => {
    const chapter = makeValidChapter();
    delete (chapter as Record<string, unknown>).title;
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects chapter with missing required field: challenges', () => {
    const chapter = makeValidChapter();
    delete (chapter as Record<string, unknown>).challenges;
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects chapter with invalid act value (act=5 not in literal union)', () => {
    const chapter = makeValidChapter({ act: 5 });
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects chapter with invalid difficulty value (difficulty=0)', () => {
    const chapter = makeValidChapter({ difficulty: 0 });
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects chapter with empty challenges array', () => {
    const chapter = makeValidChapter({ challenges: [] });
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('accepts all valid act values (1-4)', () => {
    for (const act of [1, 2, 3, 4]) {
      const chapter = makeValidChapter({ act });
      expect(() => validateChapter(chapter)).not.toThrow();
    }
  });

  it('accepts all valid difficulty values (1-5)', () => {
    for (const difficulty of [1, 2, 3, 4, 5]) {
      const chapter = makeValidChapter({ difficulty });
      expect(() => validateChapter(chapter)).not.toThrow();
    }
  });

  it('accepts all valid interaction modes', () => {
    for (const mode of ['drag', 'fill', 'code', 'mixed']) {
      const chapter = makeValidChapter({ interactionMode: mode });
      expect(() => validateChapter(chapter)).not.toThrow();
    }
  });

  it('rejects chapter with invalid interactionMode', () => {
    const chapter = makeValidChapter({ interactionMode: 'invalid' });
    expect(() => validateChapter(chapter)).toThrow();
  });
});

describe('validateChapter - challenge validation', () => {
  it('rejects challenge with empty hints array (hints must have min 1)', () => {
    const chapter = makeValidChapter();
    (chapter.challenges[0] as Record<string, unknown>).hints = [];
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects challenge with empty testCases array (testCases must have min 1)', () => {
    const chapter = makeValidChapter();
    (chapter.challenges[0] as Record<string, unknown>).testCases = [];
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects challenge with negative qiReward', () => {
    const chapter = makeValidChapter();
    (chapter.challenges[0] as Record<string, unknown>).qiReward = -10;
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('rejects challenge with qiReward > 100', () => {
    const chapter = makeValidChapter();
    (chapter.challenges[0] as Record<string, unknown>).qiReward = 150;
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('accepts qiReward at boundaries (0 and 100)', () => {
    const chapterWith0 = makeValidChapter();
    (chapterWith0.challenges[0] as Record<string, unknown>).qiReward = 0;
    expect(() => validateChapter(chapterWith0)).not.toThrow();

    const chapterWith100 = makeValidChapter();
    (chapterWith100.challenges[0] as Record<string, unknown>).qiReward = 100;
    expect(() => validateChapter(chapterWith100)).not.toThrow();
  });

  it('accepts all valid challenge types', () => {
    for (const type of ['drag', 'fill_blank', 'multiple_choice', 'free_code']) {
      const chapter = makeValidChapter();
      (chapter.challenges[0] as Record<string, unknown>).type = type;
      expect(() => validateChapter(chapter)).not.toThrow();
    }
  });

  it('rejects invalid challenge type', () => {
    const chapter = makeValidChapter();
    (chapter.challenges[0] as Record<string, unknown>).type = 'invalid_type';
    expect(() => validateChapter(chapter)).toThrow();
  });
});

describe('validateChapter - rewards validation', () => {
  it('rejects negative xp in rewards', () => {
    const chapter = makeValidChapter({ rewards: { xp: -50 } });
    expect(() => validateChapter(chapter)).toThrow();
  });

  it('accepts rewards with only xp (optional fields omitted)', () => {
    const chapter = makeValidChapter({ rewards: { xp: 100 } });
    expect(() => validateChapter(chapter)).not.toThrow();
  });
});

describe('validateAllChapters', () => {
  it('returns empty array for all valid chapters', () => {
    const chapters = {
      'ch-01': makeValidChapter({ id: 'ch-01' }),
      'ch-02': makeValidChapter({ id: 'ch-02', title: 'Chapter 2' }),
    };

    const errors = validateAllChapters(chapters);
    expect(errors).toEqual([]);
  });

  it('returns errors for invalid chapters', () => {
    const invalidChapter = makeValidChapter();
    delete (invalidChapter as Record<string, unknown>).title;

    const chapters = {
      'ch-01': makeValidChapter(),
      'ch-invalid': invalidChapter,
    };

    const errors = validateAllChapters(chapters);
    expect(errors.length).toBe(1);
    expect(errors[0].chapterId).toBe('ch-invalid');
    expect(errors[0].error).toBeDefined();
  });

  it('returns multiple errors when multiple chapters are invalid', () => {
    const invalid1 = makeValidChapter();
    delete (invalid1 as Record<string, unknown>).id;

    const invalid2 = makeValidChapter({ act: 99 });

    const chapters = {
      'ch-bad1': invalid1,
      'ch-bad2': invalid2,
    };

    const errors = validateAllChapters(chapters);
    expect(errors.length).toBe(2);
    expect(errors.map(e => e.chapterId)).toContain('ch-bad1');
    expect(errors.map(e => e.chapterId)).toContain('ch-bad2');
  });

  it('handles empty chapters object', () => {
    const errors = validateAllChapters({});
    expect(errors).toEqual([]);
  });
});
