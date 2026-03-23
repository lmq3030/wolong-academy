import { describe, it, expect } from 'vitest';
import { concepts } from '../concepts';
import { chapters } from '../chapters';

/**
 * Comprehensive validation of ALL Python concepts data.
 *
 * Validates structural invariants, cross-references to chapters,
 * and content quality checks.
 */

const chapterIds = new Set(Object.keys(chapters));

describe('Concepts data — structural completeness', () => {
  it('has exactly 16 concepts (one per chapter)', () => {
    expect(concepts).toHaveLength(16);
  });

  it('each concept has all required fields present and typed correctly', () => {
    for (const concept of concepts) {
      expect(typeof concept.id).toBe('string');
      expect(typeof concept.name).toBe('string');
      expect(typeof concept.threeKingdomsName).toBe('string');
      expect(typeof concept.description).toBe('string');
      expect(typeof concept.example).toBe('string');
      expect(typeof concept.expectedOutput).toBe('string');
      expect(typeof concept.unlockedByChapter).toBe('string');
      expect(typeof concept.act).toBe('number');
    }
  });
});

describe('Concepts data — unique IDs', () => {
  it('all concept IDs are unique', () => {
    const ids = concepts.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all concept IDs start with "concept-"', () => {
    for (const concept of concepts) {
      expect(
        concept.id.startsWith('concept-'),
        `concept "${concept.id}" does not start with "concept-"`,
      ).toBe(true);
    }
  });
});

describe('Concepts data — chapter references', () => {
  it('all unlockedByChapter values reference an existing chapter ID', () => {
    for (const concept of concepts) {
      expect(
        chapterIds.has(concept.unlockedByChapter),
        `concept "${concept.id}" references non-existent chapter "${concept.unlockedByChapter}"`,
      ).toBe(true);
    }
  });

  it('unlockedByChapter values follow the chapter-XX format', () => {
    for (const concept of concepts) {
      expect(concept.unlockedByChapter).toMatch(/^chapter-\d{2}$/);
    }
  });

  it('concept act matches the referenced chapter act', () => {
    for (const concept of concepts) {
      const chapter = chapters[concept.unlockedByChapter];
      if (chapter) {
        expect(
          concept.act,
          `concept "${concept.id}" has act=${concept.act} but chapter "${concept.unlockedByChapter}" has act=${chapter.act}`,
        ).toBe(chapter.act);
      }
    }
  });
});

describe('Concepts data — non-empty content', () => {
  it('every concept has a non-empty name', () => {
    for (const concept of concepts) {
      expect(
        concept.name.trim().length,
        `concept "${concept.id}" has empty name`,
      ).toBeGreaterThan(0);
    }
  });

  it('every concept has a non-empty threeKingdomsName', () => {
    for (const concept of concepts) {
      expect(
        concept.threeKingdomsName.trim().length,
        `concept "${concept.id}" has empty threeKingdomsName`,
      ).toBeGreaterThan(0);
    }
  });

  it('every concept has a non-empty description', () => {
    for (const concept of concepts) {
      expect(
        concept.description.trim().length,
        `concept "${concept.id}" has empty description`,
      ).toBeGreaterThan(0);
    }
  });

  it('every concept has a non-empty example', () => {
    for (const concept of concepts) {
      expect(
        concept.example.trim().length,
        `concept "${concept.id}" has empty example`,
      ).toBeGreaterThan(0);
    }
  });

  it('every concept has a non-empty expectedOutput', () => {
    for (const concept of concepts) {
      expect(
        concept.expectedOutput.trim().length,
        `concept "${concept.id}" has empty expectedOutput`,
      ).toBeGreaterThan(0);
    }
  });
});

describe('Concepts data — act validity and ordering', () => {
  it('all act values are between 1 and 4', () => {
    for (const concept of concepts) {
      expect(concept.act).toBeGreaterThanOrEqual(1);
      expect(concept.act).toBeLessThanOrEqual(4);
    }
  });

  it('all 4 acts are represented', () => {
    const acts = new Set(concepts.map((c) => c.act));
    expect(acts.size).toBe(4);
    for (let a = 1; a <= 4; a++) {
      expect(acts).toContain(a);
    }
  });

  it('concepts are ordered by act (non-decreasing)', () => {
    let lastAct = 0;
    for (const concept of concepts) {
      expect(
        concept.act,
        `concept "${concept.id}" (act=${concept.act}) appears after act=${lastAct}`,
      ).toBeGreaterThanOrEqual(lastAct);
      lastAct = concept.act;
    }
  });
});

describe('Concepts data — example code quality', () => {
  it('no concept example has unmatched double quotes per line (excluding comments)', () => {
    for (const concept of concepts) {
      const lines = concept.example.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) continue;

        // Count unescaped double quotes
        const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;
        expect(
          doubleQuotes % 2,
          `concept "${concept.id}" has unmatched double quotes in: ${line}`,
        ).toBe(0);
      }
    }
  });

  it('examples contain at least one print() call or assignment', () => {
    for (const concept of concepts) {
      const hasPrint = concept.example.includes('print(');
      const hasAssignment = concept.example.includes(' = ');
      const hasClass = concept.example.includes('class ');
      const hasDef = concept.example.includes('def ');
      expect(
        hasPrint || hasAssignment || hasClass || hasDef,
        `concept "${concept.id}" example has no print/assignment/class/def`,
      ).toBe(true);
    }
  });
});

describe('Concepts data — Three Kingdoms naming', () => {
  it('every concept has a unique threeKingdomsName', () => {
    const names = concepts.map((c) => c.threeKingdomsName);
    const uniqueNames = new Set(names);
    expect(uniqueNames.size).toBe(names.length);
  });

  it('Three Kingdoms names are not empty and contain Chinese characters', () => {
    const chineseRegex = /[\u4e00-\u9fff]/;
    for (const concept of concepts) {
      expect(
        chineseRegex.test(concept.threeKingdomsName),
        `concept "${concept.id}" threeKingdomsName "${concept.threeKingdomsName}" has no Chinese characters`,
      ).toBe(true);
    }
  });
});

describe('Concepts data — no duplicate unlockedByChapter values', () => {
  it('no two concepts unlock from the same chapter', () => {
    const chapterRefs = concepts.map((c) => c.unlockedByChapter);
    const uniqueRefs = new Set(chapterRefs);
    expect(
      uniqueRefs.size,
      `Duplicate unlockedByChapter values found: ${chapterRefs.filter(
        (r, i) => chapterRefs.indexOf(r) !== i,
      )}`,
    ).toBe(chapterRefs.length);
  });
});
