'use client';

import { useState, useCallback } from 'react';
import { usePyodide } from '@/lib/pyodide/usePyodide';
import { validateStatic, validateDynamic } from './codeValidator';
import type { Chapter } from '@/lib/levels/types';
import type { BattlePhase, LevelState } from './types';

export function useLevelEngine(chapter: Chapter) {
  const { runCode, isReady: pyodideReady } = usePyodide();

  const [state, setState] = useState<LevelState>({
    phase: 'story_intro',
    currentChallengeIndex: 0,
    qiPercent: 0,
    stars: 3, // Start at 3, deduct for errors/hints
    errorsUsed: 0,
    hintsUsed: 0,
  });

  const currentChallenge = chapter.challenges[state.currentChallengeIndex];

  // Submit code for current challenge
  const submitCode = useCallback(
    async (code: string) => {
      setState(prev => ({ ...prev, phase: 'validating' }));

      let result;
      if (
        currentChallenge.type === 'drag' ||
        currentChallenge.type === 'fill_blank' ||
        currentChallenge.type === 'multiple_choice'
      ) {
        result = validateStatic(code, currentChallenge);
      } else {
        result = await validateDynamic(code, currentChallenge.testCases, runCode);
      }

      if (result.correct) {
        const newQi = Math.min(100, state.qiPercent + currentChallenge.qiReward);
        const isLastChallenge =
          state.currentChallengeIndex >= chapter.challenges.length - 1;

        setState(prev => ({
          ...prev,
          qiPercent: newQi,
          phase: 'qi_charging',
        }));

        // After qi animation, transition
        setTimeout(() => {
          if (newQi >= 100 || isLastChallenge) {
            setState(prev => ({ ...prev, phase: 'skill_ready' }));
            setTimeout(() => {
              setState(prev => ({ ...prev, phase: 'skill_animation' }));
            }, 500);
          } else {
            setState(prev => ({
              ...prev,
              phase: 'challenge',
              currentChallengeIndex: prev.currentChallengeIndex + 1,
            }));
          }
        }, 1000); // 1s for qi charging animation
      } else {
        setState(prev => ({
          ...prev,
          phase: 'error_feedback',
          errorsUsed: prev.errorsUsed + 1,
          stars: Math.max(1, prev.errorsUsed >= 2 ? prev.stars - 1 : prev.stars), // Lose star after 3 errors
          errorMessage: result.error,
          errorLine: result.lineNumber,
        }));
      }
    },
    [state, currentChallenge, chapter, runCode]
  );

  // Use a hint
  const useHint = useCallback(() => {
    const hintIndex = Math.min(state.hintsUsed, currentChallenge.hints.length - 1);
    setState(prev => ({
      ...prev,
      hintsUsed: prev.hintsUsed + 1,
      currentHint: currentChallenge.hints[hintIndex],
      stars: Math.max(1, prev.hintsUsed >= 1 ? prev.stars - 1 : prev.stars),
    }));
  }, [state.hintsUsed, currentChallenge]);

  // Advance phase (for story intro -> challenge, error -> retry, skill anim -> victory, etc.)
  const nextPhase = useCallback(() => {
    setState(prev => {
      switch (prev.phase) {
        case 'story_intro':
          return { ...prev, phase: 'challenge' as BattlePhase };
        case 'error_feedback':
          return {
            ...prev,
            phase: 'challenge' as BattlePhase,
            errorMessage: undefined,
            errorLine: undefined,
          };
        case 'skill_animation':
          return { ...prev, phase: 'victory' as BattlePhase };
        case 'victory':
          return { ...prev, phase: 'rewards' as BattlePhase };
        default:
          return prev;
      }
    });
  }, []);

  return {
    state,
    currentChallenge,
    submitCode,
    useHint,
    nextPhase,
    pyodideReady,
    rewards: chapter.rewards,
  };
}
