import { describe, it, expect } from 'vitest';
import { chapters } from '../chapters';
import { validateChapter, validateAllChapters } from '../validation';

describe('Level Data System', () => {
  it('all chapters pass validation', () => {
    for (const [_id, chapter] of Object.entries(chapters)) {
      expect(() => validateChapter(chapter)).not.toThrow();
    }
  });

  it('validateAllChapters returns no errors', () => {
    const errors = validateAllChapters(chapters);
    expect(errors).toHaveLength(0);
  });

  it('each chapter has at least 1 challenge', () => {
    for (const chapter of Object.values(chapters)) {
      expect(chapter.challenges.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('qi rewards sum to 100 for each chapter', () => {
    for (const chapter of Object.values(chapters)) {
      const totalQi = chapter.challenges.reduce(
        (sum, c) => sum + c.qiReward,
        0
      );
      expect(totalQi).toBe(100);
    }
  });

  it('drag challenges have dragOptions', () => {
    for (const chapter of Object.values(chapters)) {
      for (const challenge of chapter.challenges) {
        if (challenge.type === 'drag') {
          expect(challenge.dragOptions).toBeDefined();
          expect(challenge.dragOptions!.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('fill_blank challenges have choices or codeTemplate', () => {
    for (const chapter of Object.values(chapters)) {
      for (const challenge of chapter.challenges) {
        if (challenge.type === 'fill_blank') {
          expect(challenge.codeTemplate || challenge.choices).toBeTruthy();
        }
      }
    }
  });

  it('all challenges have at least 1 hint', () => {
    for (const chapter of Object.values(chapters)) {
      for (const challenge of chapter.challenges) {
        expect(challenge.hints.length).toBeGreaterThanOrEqual(1);
      }
    }
  });

  it('all challenges have 3 hints (gentle → direct → near-answer)', () => {
    for (const chapter of Object.values(chapters)) {
      for (const challenge of chapter.challenges) {
        expect(challenge.hints).toHaveLength(3);
      }
    }
  });

  it('chapter-00 is the tutorial', () => {
    const ch0 = chapters['chapter-00'];
    expect(ch0.act).toBe(1);
    expect(ch0.difficulty).toBe(1);
    expect(ch0.title).toBe('桃园三结义');
  });

  it('chapter-01 covers variables and strings', () => {
    const ch1 = chapters['chapter-01'];
    expect(ch1.act).toBe(1);
    expect(ch1.difficulty).toBe(2);
    expect(ch1.title).toBe('温酒斩华雄');
    expect(ch1.interactionMode).toBe('mixed');
  });

  it('chapter IDs match their keys in the chapters record', () => {
    for (const [key, chapter] of Object.entries(chapters)) {
      expect(chapter.id).toBe(key);
    }
  });
});
