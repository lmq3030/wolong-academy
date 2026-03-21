import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { Chapter } from '@/lib/levels/types';

// Mock usePyodide before importing the hook
const mockRunCode = vi.fn();
vi.mock('@/lib/pyodide/usePyodide', () => ({
  usePyodide: () => ({
    status: 'ready',
    isReady: true,
    runCode: mockRunCode,
  }),
}));

// Mock codeValidator - validateStatic compares normalized code to correctAnswer
vi.mock('../codeValidator', () => ({
  validateStatic: vi.fn((code: string, challenge: { correctAnswer: string }) => {
    const normalize = (s: string) => s.split('\n').map((l: string) => l.trimEnd()).join('\n').trim();
    if (normalize(code) === normalize(challenge.correctAnswer)) {
      return { correct: true, output: '' };
    }
    return { correct: false, output: '', error: '代码还不太对，再检查一下吧！' };
  }),
  validateDynamic: vi.fn(),
}));

import { useLevelEngine } from '../useLevelEngine';
import { validateDynamic } from '../codeValidator';

const mockValidateDynamic = vi.mocked(validateDynamic);

const testChapter: Chapter = {
  id: 'test-chapter',
  act: 1,
  title: 'Test',
  storyIntro: 'Test story',
  pythonConcept: 'test',
  difficulty: 1,
  interactionMode: 'drag',
  challenges: [
    {
      id: 'c1',
      type: 'drag',
      prompt: 'Test',
      correctAnswer: 'print("hello")',
      testCases: [{ expectedOutput: 'hello', description: 'test' }],
      hints: ['h1', 'h2', 'h3'],
      qiReward: 50,
      dragOptions: [
        { id: 'o1', code: 'print("hello")', isCorrect: true, slot: 0 },
      ],
    },
    {
      id: 'c2',
      type: 'drag',
      prompt: 'Test 2',
      correctAnswer: 'x = 1',
      testCases: [{ expectedOutput: '1', description: 'test' }],
      hints: ['h1', 'h2', 'h3'],
      qiReward: 50,
      dragOptions: [{ id: 'o2', code: 'x = 1', isCorrect: true, slot: 0 }],
    },
  ],
  battle: {
    playerGeneral: 'test',
    playerSkill: 'test',
    bgScene: '/test.png',
  },
  rewards: { xp: 100, unlockGenerals: ['test-general'] },
};

describe('useLevelEngine', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockRunCode.mockReset();
    mockValidateDynamic.mockReset();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initial state', () => {
    it('starts with phase=story_intro, qi=0, stars=3', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      expect(result.current.state.phase).toBe('story_intro');
      expect(result.current.state.qiPercent).toBe(0);
      expect(result.current.state.stars).toBe(3);
      expect(result.current.state.currentChallengeIndex).toBe(0);
      expect(result.current.state.errorsUsed).toBe(0);
      expect(result.current.state.hintsUsed).toBe(0);
    });

    it('exposes the first challenge as currentChallenge', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));
      expect(result.current.currentChallenge.id).toBe('c1');
    });

    it('reports pyodide as ready', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));
      expect(result.current.pyodideReady).toBe(true);
    });
  });

  describe('nextPhase transitions', () => {
    it('transitions from story_intro to challenge', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      expect(result.current.state.phase).toBe('challenge');
    });

    it('transitions from error_feedback back to challenge', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      // Move to challenge first
      act(() => {
        result.current.nextPhase();
      });

      // Submit wrong code to get to error_feedback
      act(() => {
        result.current.submitCode('wrong code');
      });

      expect(result.current.state.phase).toBe('error_feedback');

      // nextPhase from error_feedback -> challenge
      act(() => {
        result.current.nextPhase();
      });

      expect(result.current.state.phase).toBe('challenge');
      expect(result.current.state.errorMessage).toBeUndefined();
      expect(result.current.state.errorLine).toBeUndefined();
    });

    it('transitions from skill_animation to victory', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      // Move through the full flow: story -> challenge -> submit correct -> qi_charging -> skill_ready -> skill_animation
      act(() => {
        result.current.nextPhase(); // story_intro -> challenge
      });

      act(() => {
        result.current.submitCode('print("hello")'); // correct answer for c1
      });

      // qi_charging phase
      expect(result.current.state.phase).toBe('qi_charging');

      // Advance timers: 1000ms for qi_charging
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      // After first challenge, qi=50, not 100, so goes to next challenge
      expect(result.current.state.phase).toBe('challenge');
      expect(result.current.state.currentChallengeIndex).toBe(1);

      // Submit correct answer for c2
      act(() => {
        result.current.submitCode('x = 1');
      });

      expect(result.current.state.phase).toBe('qi_charging');

      // qi_charging -> skill_ready (after 1000ms)
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.state.phase).toBe('skill_ready');

      // skill_ready -> skill_animation (after 500ms)
      act(() => {
        vi.advanceTimersByTime(500);
      });

      expect(result.current.state.phase).toBe('skill_animation');

      // nextPhase from skill_animation -> victory
      act(() => {
        result.current.nextPhase();
      });

      expect(result.current.state.phase).toBe('victory');
    });

    it('transitions from victory to rewards', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      // Get to victory state through full flow
      act(() => {
        result.current.nextPhase(); // story -> challenge
      });
      act(() => {
        result.current.submitCode('print("hello")');
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        result.current.submitCode('x = 1');
      });
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      act(() => {
        vi.advanceTimersByTime(500);
      });
      act(() => {
        result.current.nextPhase(); // skill_animation -> victory
      });

      expect(result.current.state.phase).toBe('victory');

      act(() => {
        result.current.nextPhase(); // victory -> rewards
      });

      expect(result.current.state.phase).toBe('rewards');
    });

    it('does not transition from challenge phase via nextPhase', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase(); // story_intro -> challenge
      });

      act(() => {
        result.current.nextPhase(); // challenge -> should stay challenge (default case)
      });

      expect(result.current.state.phase).toBe('challenge');
    });
  });

  describe('submitCode', () => {
    it('with correct code: qi increases and transitions to qi_charging', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase(); // story -> challenge
      });

      act(() => {
        result.current.submitCode('print("hello")');
      });

      expect(result.current.state.phase).toBe('qi_charging');
      expect(result.current.state.qiPercent).toBe(50);
    });

    it('with wrong code: phase goes to error_feedback and errorsUsed increments', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      act(() => {
        result.current.submitCode('wrong code');
      });

      expect(result.current.state.phase).toBe('error_feedback');
      expect(result.current.state.errorsUsed).toBe(1);
      expect(result.current.state.errorMessage).toBeDefined();
    });

    it('after error_feedback, retrying same challenge', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      act(() => {
        result.current.submitCode('wrong');
      });

      expect(result.current.state.currentChallengeIndex).toBe(0);

      act(() => {
        result.current.nextPhase(); // error_feedback -> challenge
      });

      expect(result.current.state.currentChallengeIndex).toBe(0);
      expect(result.current.currentChallenge.id).toBe('c1');
    });

    it('correct answer after qi_charging moves to next challenge', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      act(() => {
        result.current.submitCode('print("hello")');
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.state.phase).toBe('challenge');
      expect(result.current.state.currentChallengeIndex).toBe(1);
      expect(result.current.currentChallenge.id).toBe('c2');
    });
  });

  describe('stars deduction', () => {
    it('loses a star after 3 errors (errorsUsed >= 2 when third error triggers)', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      // First error: errorsUsed becomes 1, prev.errorsUsed was 0 (< 2), no star loss
      act(() => {
        result.current.submitCode('wrong');
      });
      expect(result.current.state.stars).toBe(3);

      act(() => {
        result.current.nextPhase();
      });

      // Second error: errorsUsed becomes 2, prev.errorsUsed was 1 (< 2), no star loss
      act(() => {
        result.current.submitCode('wrong');
      });
      expect(result.current.state.stars).toBe(3);

      act(() => {
        result.current.nextPhase();
      });

      // Third error: errorsUsed becomes 3, prev.errorsUsed was 2 (>= 2), lose a star
      act(() => {
        result.current.submitCode('wrong');
      });
      expect(result.current.state.stars).toBe(2);
    });

    it('loses a star after 2+ hints (hintsUsed >= 1 when second hint triggers)', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      // First hint: hintsUsed becomes 1, prev.hintsUsed was 0 (< 1), no star loss
      act(() => {
        result.current.useHint();
      });
      expect(result.current.state.stars).toBe(3);

      // Second hint: hintsUsed becomes 2, prev.hintsUsed was 1 (>= 1), lose a star
      act(() => {
        result.current.useHint();
      });
      expect(result.current.state.stars).toBe(2);
    });

    it('stars never go below 1', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      // Use many hints and errors to try to go below 1
      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.useHint();
        });
      }

      for (let i = 0; i < 10; i++) {
        act(() => {
          result.current.submitCode('wrong');
        });
        act(() => {
          result.current.nextPhase();
        });
      }

      expect(result.current.state.stars).toBeGreaterThanOrEqual(1);
    });
  });

  describe('useHint', () => {
    it('returns hint text and increments hintsUsed', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      act(() => {
        result.current.useHint();
      });

      expect(result.current.state.hintsUsed).toBe(1);
      expect(result.current.state.currentHint).toBe('h1');
    });

    it('returns subsequent hints', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      act(() => {
        result.current.useHint();
      });
      expect(result.current.state.currentHint).toBe('h1');

      act(() => {
        result.current.useHint();
      });
      expect(result.current.state.currentHint).toBe('h2');

      act(() => {
        result.current.useHint();
      });
      expect(result.current.state.currentHint).toBe('h3');
    });

    it('clamps to last hint when exhausted', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      act(() => {
        result.current.nextPhase();
      });

      // Use all 3 hints
      act(() => { result.current.useHint(); });
      act(() => { result.current.useHint(); });
      act(() => { result.current.useHint(); });

      // Fourth use should still return last hint
      act(() => { result.current.useHint(); });
      expect(result.current.state.currentHint).toBe('h3');
    });
  });

  describe('edge cases', () => {
    it('goes to skill_ready on last challenge even when qi is below 100', () => {
      // Create a chapter where total qi rewards don't reach 100
      const lowQiChapter: Chapter = {
        ...testChapter,
        challenges: [
          {
            id: 'lq1',
            type: 'drag',
            prompt: 'Low qi 1',
            correctAnswer: 'print("a")',
            testCases: [{ expectedOutput: 'a', description: 'test' }],
            hints: ['h1', 'h2', 'h3'],
            qiReward: 30,
            dragOptions: [{ id: 'o1', code: 'print("a")', isCorrect: true, slot: 0 }],
          },
          {
            id: 'lq2',
            type: 'drag',
            prompt: 'Low qi 2',
            correctAnswer: 'print("b")',
            testCases: [{ expectedOutput: 'b', description: 'test' }],
            hints: ['h1', 'h2', 'h3'],
            qiReward: 30,
            dragOptions: [{ id: 'o2', code: 'print("b")', isCorrect: true, slot: 0 }],
          },
          {
            id: 'lq3',
            type: 'drag',
            prompt: 'Low qi 3',
            correctAnswer: 'print("c")',
            testCases: [{ expectedOutput: 'c', description: 'test' }],
            hints: ['h1', 'h2', 'h3'],
            qiReward: 30,
            dragOptions: [{ id: 'o3', code: 'print("c")', isCorrect: true, slot: 0 }],
          },
        ],
      };

      const { result } = renderHook(() => useLevelEngine(lowQiChapter));

      act(() => { result.current.nextPhase(); }); // story -> challenge

      // Challenge 1: qi=30
      act(() => { result.current.submitCode('print("a")'); });
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.state.phase).toBe('challenge');
      expect(result.current.state.qiPercent).toBe(30);

      // Challenge 2: qi=60
      act(() => { result.current.submitCode('print("b")'); });
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.state.phase).toBe('challenge');
      expect(result.current.state.qiPercent).toBe(60);

      // Challenge 3 (LAST): qi=90, below 100 but should still trigger skill_ready
      act(() => { result.current.submitCode('print("c")'); });
      expect(result.current.state.qiPercent).toBe(90);
      act(() => { vi.advanceTimersByTime(1000); });
      expect(result.current.state.phase).toBe('skill_ready');
    });

    it('clamps qiPercent to 100 on oversized qi rewards', () => {
      // Chapter where a single challenge gives qi=80, but total would exceed 100
      const bigQiChapter: Chapter = {
        ...testChapter,
        challenges: [
          {
            id: 'bq1',
            type: 'drag',
            prompt: 'Big qi 1',
            correctAnswer: 'print("a")',
            testCases: [{ expectedOutput: 'a', description: 'test' }],
            hints: ['h1', 'h2', 'h3'],
            qiReward: 80,
            dragOptions: [{ id: 'o1', code: 'print("a")', isCorrect: true, slot: 0 }],
          },
          {
            id: 'bq2',
            type: 'drag',
            prompt: 'Big qi 2',
            correctAnswer: 'print("b")',
            testCases: [{ expectedOutput: 'b', description: 'test' }],
            hints: ['h1', 'h2', 'h3'],
            qiReward: 50,
            dragOptions: [{ id: 'o2', code: 'print("b")', isCorrect: true, slot: 0 }],
          },
        ],
      };

      const { result } = renderHook(() => useLevelEngine(bigQiChapter));

      act(() => { result.current.nextPhase(); }); // story -> challenge

      // Challenge 1: qi=80
      act(() => { result.current.submitCode('print("a")'); });
      expect(result.current.state.qiPercent).toBe(80);
      act(() => { vi.advanceTimersByTime(1000); });

      // Challenge 2: qi should clamp to 100, not 130
      act(() => { result.current.submitCode('print("b")'); });
      expect(result.current.state.qiPercent).toBe(100);
    });

    it('uses dynamic validator for free_code challenges', async () => {
      const freeCodeChapter: Chapter = {
        ...testChapter,
        challenges: [
          {
            id: 'fc1',
            type: 'free_code',
            prompt: 'Write code',
            correctAnswer: 'print("hi")',
            testCases: [{ expectedOutput: 'hi', description: 'test' }],
            hints: ['h1', 'h2', 'h3'],
            qiReward: 100,
          },
        ],
      };

      // Configure the validateDynamic mock to resolve with a correct result
      mockValidateDynamic.mockResolvedValue({ correct: true, output: 'hi' });

      const { result } = renderHook(() => useLevelEngine(freeCodeChapter));

      act(() => { result.current.nextPhase(); });

      await act(async () => {
        await result.current.submitCode('print("hi")');
      });

      // validateDynamic should have been called (not validateStatic)
      expect(mockValidateDynamic).toHaveBeenCalled();
      expect(result.current.state.phase).toBe('qi_charging');
    });

    it('routes multiple_choice through static validation', () => {
      const mcChapter: Chapter = {
        ...testChapter,
        challenges: [
          {
            id: 'mc1',
            type: 'multiple_choice',
            prompt: 'Pick one',
            correctAnswer: 'print("hello")',
            codeTemplate: 'print(___)',
            choices: ['"hello"', '"bye"'],
            testCases: [{ expectedOutput: 'hello', description: 'test' }],
            hints: ['h1', 'h2', 'h3'],
            qiReward: 100,
          },
        ],
      };

      const { result } = renderHook(() => useLevelEngine(mcChapter));

      act(() => { result.current.nextPhase(); });

      act(() => {
        result.current.submitCode('print("hello")');
      });

      // Should NOT have called runCode (dynamic); validateStatic handles it
      expect(mockRunCode).not.toHaveBeenCalled();
      expect(result.current.state.phase).toBe('qi_charging');
    });
  });

  describe('complete flow: story -> all challenges correct -> victory', () => {
    it('completes the full level flow', () => {
      const { result } = renderHook(() => useLevelEngine(testChapter));

      // Phase 1: story_intro
      expect(result.current.state.phase).toBe('story_intro');

      // Phase 2: challenge
      act(() => {
        result.current.nextPhase();
      });
      expect(result.current.state.phase).toBe('challenge');

      // Submit correct answer for challenge 1
      act(() => {
        result.current.submitCode('print("hello")');
      });
      expect(result.current.state.phase).toBe('qi_charging');
      expect(result.current.state.qiPercent).toBe(50);

      // qi_charging -> next challenge (qi < 100)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.state.phase).toBe('challenge');
      expect(result.current.state.currentChallengeIndex).toBe(1);

      // Submit correct answer for challenge 2
      act(() => {
        result.current.submitCode('x = 1');
      });
      expect(result.current.state.phase).toBe('qi_charging');
      expect(result.current.state.qiPercent).toBe(100);

      // qi_charging -> skill_ready (qi = 100)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.state.phase).toBe('skill_ready');

      // skill_ready -> skill_animation
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(result.current.state.phase).toBe('skill_animation');

      // skill_animation -> victory
      act(() => {
        result.current.nextPhase();
      });
      expect(result.current.state.phase).toBe('victory');

      // victory -> rewards
      act(() => {
        result.current.nextPhase();
      });
      expect(result.current.state.phase).toBe('rewards');

      // Stars should remain at 3 (no errors)
      expect(result.current.state.stars).toBe(3);
    });
  });
});
