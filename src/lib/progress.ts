'use client';

import { getCurrentUser } from './user';

export interface ChapterResult {
  stars: number;       // 1-3
  completedAt: string; // ISO date string
}

export interface LocalProgress {
  completedChapters: Record<string, ChapterResult>;
  unlockedGenerals: string[];
  xp: number;
  level: number;
}

/**
 * Get the localStorage key for progress data.
 * When a user is active, progress is scoped to that user.
 * Falls back to the legacy key for backward compatibility.
 */
function getStorageKey(): string {
  const user = getCurrentUser();
  return user ? `wolong-progress-${user.id}` : 'wolong-progress';
}

function defaultProgress(): LocalProgress {
  return {
    completedChapters: {},
    unlockedGenerals: [],
    xp: 0,
    level: 1,
  };
}

export function getProgress(): LocalProgress {
  if (typeof window === 'undefined') return defaultProgress();
  try {
    const stored = localStorage.getItem(getStorageKey());
    return stored ? JSON.parse(stored) : defaultProgress();
  } catch {
    return defaultProgress();
  }
}

function saveProgress(progress: LocalProgress): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(getStorageKey(), JSON.stringify(progress));
  } catch {
    // localStorage may be full or unavailable — silently fail for MVP
  }
}

/**
 * Record that a chapter was completed with a given star rating.
 * Only updates if the new star count is higher than any previous attempt.
 */
export function saveChapterProgress(chapterId: string, stars: number): void {
  const progress = getProgress();
  const existing = progress.completedChapters[chapterId];

  if (!existing || stars > existing.stars) {
    progress.completedChapters[chapterId] = {
      stars: Math.min(3, Math.max(1, stars)),
      completedAt: new Date().toISOString(),
    };
  }

  saveProgress(progress);
}

/**
 * Add XP and recalculate level. Simple formula: each level = 300 XP.
 */
export function addXP(amount: number): void {
  const progress = getProgress();
  progress.xp += amount;
  progress.level = Math.floor(progress.xp / 300) + 1;
  saveProgress(progress);
}

/**
 * Unlock generals by their ids.
 */
export function unlockGenerals(generalIds: string[]): void {
  const progress = getProgress();
  const currentSet = new Set(progress.unlockedGenerals);
  for (const id of generalIds) {
    currentSet.add(id);
  }
  progress.unlockedGenerals = Array.from(currentSet);
  saveProgress(progress);
}

/**
 * Determine if a chapter is unlocked.
 * Rules:
 * - The very first chapter (index 0 in a sorted list) is always unlocked.
 * - Any other chapter is unlocked if the chapter immediately before it
 *   (by sort order: act, then id) has been completed.
 */
export function isChapterUnlocked(
  chapterId: string,
  sortedChapterIds: string[],
  completedChapters: Record<string, ChapterResult>,
): boolean {
  const index = sortedChapterIds.indexOf(chapterId);
  // First chapter is always unlocked
  if (index <= 0) return true;
  // Unlocked if previous chapter is completed
  const prevId = sortedChapterIds[index - 1];
  return prevId in completedChapters;
}

/**
 * Reset all progress (for debugging / testing).
 */
export function resetProgress(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(getStorageKey());
}
