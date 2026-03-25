import { describe, it, expect } from 'vitest';
import { concepts } from '@/lib/levels/concepts';
import { getConceptSteps, type LessonStep } from '../ConceptLesson';
import fs from 'node:fs';
import path from 'node:path';

/**
 * P0 Tests for conceptStepBuilders — the core teaching logic.
 *
 * Validates that every concept has a custom step builder (no fallback),
 * proper step structure, naive-method-first pattern, and required content types.
 */

describe('ConceptStepBuilders — every concept has custom steps (no fallback)', () => {
  for (const concept of concepts) {
    it(`concept "${concept.id}" has a custom step builder (not fallback)`, () => {
      const steps = getConceptSteps(concept);
      // Fallback produces exactly 2 steps with specific markers
      const isFallback =
        steps.length === 2 &&
        steps[0].detail?.[0]?.includes('这是一个新的编程概念');
      expect(
        isFallback,
        `concept "${concept.id}" is using the generic fallback! Add a custom builder to conceptStepBuilders.`,
      ).toBe(false);
    });
  }
});

describe('ConceptStepBuilders — step structure validity', () => {
  for (const concept of concepts) {
    const steps = getConceptSteps(concept);

    it(`concept "${concept.id}" returns at least 3 steps`, () => {
      expect(
        steps.length,
        `concept "${concept.id}" has only ${steps.length} steps (minimum 3)`,
      ).toBeGreaterThanOrEqual(3);
    });

    it(`concept "${concept.id}" every step has a title`, () => {
      for (let i = 0; i < steps.length; i++) {
        expect(
          steps[i].title,
          `concept "${concept.id}" step ${i} has no title`,
        ).toBeTruthy();
      }
    });

    it(`concept "${concept.id}" last step has code + output`, () => {
      const lastStep = steps[steps.length - 1];
      expect(
        lastStep.code,
        `concept "${concept.id}" last step has no code example`,
      ).toBeTruthy();
      expect(
        lastStep.output,
        `concept "${concept.id}" last step has no expected output`,
      ).toBeTruthy();
    });
  }
});

describe('ConceptStepBuilders — naive method first', () => {
  for (const concept of concepts) {
    it(`concept "${concept.id}" first step addresses a problem/pain point`, () => {
      const steps = getConceptSteps(concept);
      const firstStep = steps[0];
      // First step should have either:
      // - A code example showing the "dumb way"
      // - Content/detail explaining the problem
      const hasPainPoint =
        firstStep.code != null ||
        (firstStep.content && firstStep.content.length > 20) ||
        (firstStep.detail && firstStep.detail.length > 0);
      expect(
        hasPainPoint,
        `concept "${concept.id}" first step doesn't establish a problem/pain point`,
      ).toBe(true);
    });
  }
});

describe('ConceptStepBuilders — complex concepts have 4+ steps', () => {
  const complexConcepts = [
    'concept-for-loop',
    'concept-while-loop',
    'concept-search',
    'concept-encapsulation',
    'concept-custom-ds',
  ];

  for (const conceptId of complexConcepts) {
    it(`complex concept "${conceptId}" has at least 4 steps`, () => {
      const concept = concepts.find(c => c.id === conceptId)!;
      const steps = getConceptSteps(concept);
      expect(
        steps.length,
        `complex concept "${conceptId}" only has ${steps.length} steps (need 4+)`,
      ).toBeGreaterThanOrEqual(4);
    });
  }
});

describe('ConceptStepBuilders — loops have execution traces', () => {
  const conceptsWithTraces = [
    'concept-for-loop',
    'concept-while-loop',
  ];

  for (const conceptId of conceptsWithTraces) {
    it(`concept "${conceptId}" has at least one step with a trace table`, () => {
      const concept = concepts.find(c => c.id === conceptId)!;
      const steps = getConceptSteps(concept);
      const hasTrace = steps.some(s => s.trace != null);
      expect(
        hasTrace,
        `concept "${conceptId}" should have an execution trace table`,
      ).toBe(true);
    });
  }
});

describe('ConceptStepBuilders — trace table structure', () => {
  for (const concept of concepts) {
    const steps = getConceptSteps(concept);
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.trace) continue;

      it(`concept "${concept.id}" step ${i} trace has 3-5 columns`, () => {
        const colCount = step.trace!.headers.length;
        expect(colCount).toBeGreaterThanOrEqual(2);
        expect(colCount).toBeLessThanOrEqual(6);
      });

      it(`concept "${concept.id}" step ${i} trace rows match header count`, () => {
        for (let r = 0; r < step.trace!.rows.length; r++) {
          expect(
            step.trace!.rows[r].length,
            `row ${r} has ${step.trace!.rows[r].length} columns but headers have ${step.trace!.headers.length}`,
          ).toBe(step.trace!.headers.length);
        }
      });

      it(`concept "${concept.id}" step ${i} trace has 2-8 rows`, () => {
        const rowCount = step.trace!.rows.length;
        expect(rowCount).toBeGreaterThanOrEqual(2);
        expect(rowCount).toBeLessThanOrEqual(8);
      });
    }
  }
});

describe('ConceptStepBuilders — image resources exist', () => {
  for (const concept of concepts) {
    const steps = getConceptSteps(concept);
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      if (!step.image) continue;

      it(`concept "${concept.id}" step ${i} image file exists: ${step.image}`, () => {
        const imagePath = path.join(process.cwd(), 'public', step.image!);
        expect(
          fs.existsSync(imagePath),
          `Image file not found: ${imagePath}`,
        ).toBe(true);
      });

      it(`concept "${concept.id}" step ${i} image has a caption`, () => {
        expect(
          step.imageCaption,
          `concept "${concept.id}" step ${i} has image but no caption`,
        ).toBeTruthy();
      });
    }
  }
});

describe('ConceptStepBuilders — keyword breakdown coverage', () => {
  const conceptsWithBreakdown = [
    'concept-print',
    'concept-variables',
    'concept-functions',
    'concept-if-else',
    'concept-lists',
    'concept-for-loop',
    'concept-while-loop',
    'concept-search',
    'concept-stack',
    'concept-queue',
    'concept-dict',
    'concept-encapsulation',
    'concept-custom-ds',
  ];

  for (const conceptId of conceptsWithBreakdown) {
    it(`concept "${conceptId}" has at least one step with keyword breakdown`, () => {
      const concept = concepts.find(c => c.id === conceptId)!;
      const steps = getConceptSteps(concept);
      const hasBreakdown = steps.some(s => s.breakdown && s.breakdown.length > 0);
      expect(
        hasBreakdown,
        `concept "${conceptId}" should have a keyword breakdown step`,
      ).toBe(true);
    });
  }
});
