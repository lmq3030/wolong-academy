'use client';

import { useState, useCallback } from 'react';
import { usePyodide } from '@/lib/pyodide/usePyodide';
import { validateStatic, validateDynamic } from './codeValidator';
import type { Chapter } from '@/lib/levels/types';
import type { BattlePhase, LevelState } from './types';

export function useLevelEngine(chapter: Chapter, initialChallengeIndex = 0) {
  const { runCode, isReady: pyodideReady } = usePyodide();

  const [state, setState] = useState<LevelState>({
    // Skip intros if resuming mid-chapter
    phase: initialChallengeIndex > 0 ? 'challenge' : 'concept_intro',
    currentChallengeIndex: initialChallengeIndex,
    // Pre-fill qi for completed challenges when resuming
    qiPercent: chapter.challenges
      .slice(0, initialChallengeIndex)
      .reduce((sum, c) => sum + c.qiReward, 0),
    stars: 3,
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

        // Get expected output for display
        const expectedOutput = currentChallenge.testCases[0]?.expectedOutput || '';

        setState(prev => ({
          ...prev,
          qiPercent: newQi,
          phase: 'qi_charging',
          lastCorrectCode: code,
          lastCorrectOutput: expectedOutput,
        }));
        // qi_charging now waits for user to click "继续" via nextPhase()
      } else {
        setState(prev => ({
          ...prev,
          phase: 'error_feedback',
          errorsUsed: prev.errorsUsed + 1,
          stars: Math.max(1, prev.errorsUsed >= 2 ? prev.stars - 1 : prev.stars),
          errorMessage: result.error,
          errorLine: result.lineNumber,
          lastCorrectCode: code,          // Store the attempted code for display
          lastCorrectOutput: result.output || '', // Store actual output (or empty)
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
        case 'concept_intro':
          return { ...prev, phase: 'story_intro' as BattlePhase };
        case 'story_intro':
          return { ...prev, phase: 'challenge' as BattlePhase };
        case 'qi_charging': {
          // User clicked "继续" on correct feedback — advance to next challenge or skill animation
          const isLast = prev.currentChallengeIndex >= chapter.challenges.length - 1;
          if (prev.qiPercent >= 100 || isLast) {
            return { ...prev, phase: 'skill_animation' as BattlePhase };
          }
          return {
            ...prev,
            phase: 'challenge' as BattlePhase,
            currentChallengeIndex: prev.currentChallengeIndex + 1,
            lastCorrectCode: undefined,
            lastCorrectOutput: undefined,
          };
        }
        case 'skill_ready':
          return { ...prev, phase: 'skill_animation' as BattlePhase };
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
