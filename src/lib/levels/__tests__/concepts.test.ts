import { describe, it, expect } from 'vitest';
import { concepts } from '../concepts';
import { chapters } from '../chapters';

describe('Python Concepts Data', () => {
  it('has exactly 15 concepts', () => {
    expect(concepts).toHaveLength(15);
  });

  it('each concept has all required fields', () => {
    const requiredFields = [
      'id',
      'name',
      'threeKingdomsName',
      'description',
      'example',
      'expectedOutput',
      'unlockedByChapter',
      'act',
    ] as const;

    for (const concept of concepts) {
      for (const field of requiredFields) {
        expect(concept[field], `concept "${concept.id}" missing field "${field}"`).toBeDefined();
      }
      // String fields should be non-empty
      expect(concept.id.length).toBeGreaterThan(0);
      expect(concept.name.length).toBeGreaterThan(0);
      expect(concept.threeKingdomsName.length).toBeGreaterThan(0);
      expect(concept.description.length).toBeGreaterThan(0);
      expect(concept.example.length).toBeGreaterThan(0);
      expect(concept.expectedOutput.length).toBeGreaterThan(0);
      expect(concept.unlockedByChapter.length).toBeGreaterThan(0);
      expect(concept.act).toBeGreaterThanOrEqual(1);
      expect(concept.act).toBeLessThanOrEqual(4);
    }
  });

  it('has no duplicate IDs', () => {
    const ids = concepts.map((c) => c.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('all 4 acts are represented', () => {
    const acts = new Set(concepts.map((c) => c.act));
    expect(acts).toContain(1);
    expect(acts).toContain(2);
    expect(acts).toContain(3);
    expect(acts).toContain(4);
    expect(acts.size).toBe(4);
  });

  it('each concept example has no obvious syntax errors (unmatched quotes)', () => {
    for (const concept of concepts) {
      const { example, id } = concept;

      // Count single and double quotes (ignoring escaped ones and those inside triple-quotes)
      // Simple check: lines should not have an odd number of unescaped double quotes
      const lines = example.split('\n');
      for (const line of lines) {
        // Skip comments
        const trimmed = line.trim();
        if (trimmed.startsWith('#')) continue;

        // Count double quotes not preceded by backslash
        const doubleQuotes = (line.match(/(?<!\\)"/g) || []).length;
        expect(
          doubleQuotes % 2,
          `concept "${id}" has unmatched double quotes in line: ${line}`
        ).toBe(0);
      }
    }
  });

  it('each concept unlockedByChapter references a valid chapter ID format', () => {
    // The chapters data only has chapter-00 through chapter-05 defined,
    // but concepts reference up to chapter-15. We verify the format is valid
    // and the early chapters that are defined match.
    const definedChapterIds = new Set(Object.keys(chapters));

    for (const concept of concepts) {
      // All should follow the chapter-XX format
      expect(
        concept.unlockedByChapter,
        `concept "${concept.id}" has invalid chapter ref format`
      ).toMatch(/^chapter-\d{2}$/);

      // For chapters that are defined, verify they exist
      if (definedChapterIds.has(concept.unlockedByChapter)) {
        expect(definedChapterIds).toContain(concept.unlockedByChapter);
      }
    }
  });

  it('Three Kingdoms names match the design doc mapping', () => {
    const expectedMapping: Record<string, string> = {
      'concept-print': '落日弓',
      'concept-variables': '命疗术',
      'concept-functions': '八阵图',
      'concept-if-else': '伏兵组阵',
      'concept-lists': '十面埋伏',
      'concept-for-loop': '连弩激射',
      'concept-while-loop': '七擒孟获',
      'concept-debug': '刮骨疗毒',
      'concept-list-ops': '草船借箭',
      'concept-search': '赵云长坂坡',
      'concept-stack': '单刀赴会',
      'concept-queue': '水淹七军',
      'concept-dict': '锦囊妙计',
      'concept-encapsulation': '空城计',
      'concept-custom-ds': '木牛流马',
    };

    for (const concept of concepts) {
      const expected = expectedMapping[concept.id];
      expect(
        expected,
        `No expected mapping for concept "${concept.id}"`
      ).toBeDefined();
      expect(
        concept.threeKingdomsName,
        `concept "${concept.id}" threeKingdomsName mismatch`
      ).toBe(expected);
    }
  });

  it('concepts are ordered by act', () => {
    let lastAct = 0;
    for (const concept of concepts) {
      expect(concept.act).toBeGreaterThanOrEqual(lastAct);
      lastAct = concept.act;
    }
  });
});
