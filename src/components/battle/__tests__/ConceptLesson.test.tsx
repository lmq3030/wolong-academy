import { describe, it, expect } from 'vitest';
import { concepts } from '@/lib/levels/concepts';

/**
 * Tests for ConceptLesson teaching quality.
 *
 * These tests enforce the design principles documented in CLAUDE.md:
 * - Every concept has a custom step builder (no fallback)
 * - Every concept starts with a "naive method" step
 * - Code examples explain key Python keywords via comments
 * - ConceptLesson step builders produce valid step arrays
 */

// We can't easily import the step builders directly since they're inside the component,
// so we test the concepts.ts data which is the foundation of all teaching content.

describe('Concept code examples — comment coverage', () => {
  // Every concept's code example should contain # comments
  it('every concept example has at least one comment line', () => {
    for (const concept of concepts) {
      const commentLines = concept.example.split('\n').filter(l => l.trim().startsWith('#'));
      expect(
        commentLines.length,
        `concept "${concept.id}" example has no # comments`,
      ).toBeGreaterThan(0);
    }
  });

  // Comments should outnumber or at least approach code lines
  it('every concept has at least 1 comment per 3 code lines', () => {
    for (const concept of concepts) {
      const lines = concept.example.split('\n').filter(l => l.trim().length > 0);
      const commentLines = lines.filter(l => l.trim().startsWith('#'));
      const codeLines = lines.filter(l => !l.trim().startsWith('#'));
      const ratio = commentLines.length / Math.max(codeLines.length, 1);
      expect(
        ratio,
        `concept "${concept.id}" has too few comments: ${commentLines.length} comments for ${codeLines.length} code lines`,
      ).toBeGreaterThanOrEqual(0.33);
    }
  });
});

describe('Concept code examples — Python keyword explanations', () => {
  // If a concept example uses a keyword, there should be a comment explaining it

  const keywordTests: { keyword: string; concepts: string[]; description: string }[] = [
    { keyword: 'def ', concepts: ['concept-functions', 'concept-encapsulation', 'concept-custom-ds'], description: 'def keyword' },
    { keyword: 'for ', concepts: ['concept-for-loop', 'concept-search', 'concept-custom-ds'], description: 'for keyword' },
    { keyword: 'while ', concepts: ['concept-while-loop'], description: 'while keyword' },
    { keyword: 'if ', concepts: ['concept-if-else', 'concept-search'], description: 'if keyword' },
    { keyword: 'else:', concepts: ['concept-if-else'], description: 'else keyword' },
    { keyword: 'class ', concepts: ['concept-encapsulation', 'concept-custom-ds'], description: 'class keyword' },
    { keyword: 'import ', concepts: ['concept-queue'], description: 'import keyword' },
    { keyword: '.append(', concepts: ['concept-list-ops', 'concept-stack'], description: 'append method' },
    { keyword: '.pop(', concepts: ['concept-list-ops', 'concept-stack'], description: 'pop method' },
    { keyword: 'range(', concepts: ['concept-for-loop'], description: 'range function' },
    { keyword: 'len(', concepts: ['concept-lists', 'concept-list-ops', 'concept-strings', 'concept-dict'], description: 'len function' },
    { keyword: 'str(', concepts: ['concept-strings', 'concept-custom-ds'], description: 'str function' },
    { keyword: 'enumerate(', concepts: ['concept-search'], description: 'enumerate function' },
    { keyword: '+=', concepts: ['concept-while-loop'], description: '+= operator' },
  ];

  for (const { keyword, concepts: conceptIds, description } of keywordTests) {
    for (const conceptId of conceptIds) {
      it(`concept "${conceptId}" explains ${description} in comments`, () => {
        const concept = concepts.find(c => c.id === conceptId);
        expect(concept, `concept "${conceptId}" not found`).toBeDefined();

        const example = concept!.example;
        // Check that the keyword appears in the example
        expect(
          example.includes(keyword),
          `concept "${conceptId}" doesn't use ${description}`,
        ).toBe(true);

        // Check that there's a comment mentioning this keyword or its purpose
        const commentLines = example.split('\n').filter(l => l.trim().startsWith('#'));
        const keywordBase = keyword.trim().replace(/[(.]/g, '');
        const hasExplanation = commentLines.some(l =>
          l.toLowerCase().includes(keywordBase.toLowerCase()) ||
          l.includes(keyword.trim())
        );
        expect(
          hasExplanation,
          `concept "${conceptId}" uses ${description} but no comment explains it. Comments: ${commentLines.join(' | ')}`,
        ).toBe(true);
      });
    }
  }
});

describe('Concept code examples — symbol explanations', () => {
  // Key symbols should be explained when first introduced

  it('concept-print explains # (comments)', () => {
    const concept = concepts.find(c => c.id === 'concept-print')!;
    const hasCommentExplanation = concept.example.includes('注释') || concept.example.includes('井号');
    expect(hasCommentExplanation, 'print example should explain what # means').toBe(true);
  });

  it('concept-variables explains = (assignment)', () => {
    const concept = concepts.find(c => c.id === 'concept-variables')!;
    const hasAssignmentExplanation = concept.example.includes('赋值') || concept.example.includes('放进');
    expect(hasAssignmentExplanation, 'variables example should explain = operator').toBe(true);
  });

  it('concept-functions explains : (colon)', () => {
    const concept = concepts.find(c => c.id === 'concept-functions')!;
    const hasColonExplanation = concept.example.includes('冒号');
    expect(hasColonExplanation, 'functions example should explain colon').toBe(true);
  });

  it('concept-functions explains indentation', () => {
    const concept = concepts.find(c => c.id === 'concept-functions')!;
    const hasIndentExplanation = concept.example.includes('缩进');
    expect(hasIndentExplanation, 'functions example should explain indentation').toBe(true);
  });

  it('concept-lists explains [] (square brackets)', () => {
    const concept = concepts.find(c => c.id === 'concept-lists')!;
    const hasBracketExplanation = concept.example.includes('方括号');
    expect(hasBracketExplanation, 'lists example should explain []').toBe(true);
  });

  it('concept-list-ops explains . (dot syntax)', () => {
    const concept = concepts.find(c => c.id === 'concept-list-ops')!;
    const hasDotExplanation = concept.example.includes('点号');
    expect(hasDotExplanation, 'list-ops example should explain dot syntax').toBe(true);
  });

  it('concept-dict explains {} (curly braces)', () => {
    const concept = concepts.find(c => c.id === 'concept-dict')!;
    const hasBraceExplanation = concept.example.includes('花括号');
    expect(hasBraceExplanation, 'dict example should explain {}').toBe(true);
  });

  it('concept-if-else explains True/False', () => {
    const concept = concepts.find(c => c.id === 'concept-if-else')!;
    const hasBoolExplanation = concept.example.includes('True') && concept.example.includes('False');
    expect(hasBoolExplanation, 'if-else example should mention True/False').toBe(true);
  });

  it('concept-search explains == (equality)', () => {
    const concept = concepts.find(c => c.id === 'concept-search')!;
    const hasEqualityExplanation = concept.example.includes('==') && concept.example.includes('是否相等');
    expect(hasEqualityExplanation, 'search example should explain ==').toBe(true);
  });
});

describe('Concept descriptions — teaching quality', () => {
  it('every concept description is at least 15 characters (meaningful, not a stub)', () => {
    for (const concept of concepts) {
      expect(
        concept.description.length,
        `concept "${concept.id}" description is too short: "${concept.description}"`,
      ).toBeGreaterThanOrEqual(15);
    }
  });

  it('every concept description contains Chinese characters', () => {
    const chineseRegex = /[\u4e00-\u9fff]/;
    for (const concept of concepts) {
      expect(
        chineseRegex.test(concept.description),
        `concept "${concept.id}" description has no Chinese characters`,
      ).toBe(true);
    }
  });
});
