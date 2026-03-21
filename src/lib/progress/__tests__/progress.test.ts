import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getProgress,
  saveChapterProgress,
  addXP,
  unlockGenerals,
  isChapterUnlocked,
  resetProgress,
} from '@/lib/progress';
import type { LocalProgress, ChapterResult } from '@/lib/progress';

// Mock localStorage as a Map-based implementation
function createMockLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: vi.fn((key: string) => store.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => store.set(key, value)),
    removeItem: vi.fn((key: string) => store.delete(key)),
    clear: vi.fn(() => store.clear()),
    get length() { return store.size; },
    key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
  };
}

describe('progress', () => {
  let mockStorage: ReturnType<typeof createMockLocalStorage>;

  beforeEach(() => {
    mockStorage = createMockLocalStorage();
    vi.stubGlobal('localStorage', mockStorage);
  });

  const defaultProgress: LocalProgress = {
    completedChapters: {},
    unlockedGenerals: [],
    xp: 0,
    level: 1,
  };

  describe('getProgress', () => {
    it('returns default progress on empty storage', () => {
      const progress = getProgress();
      expect(progress).toEqual(defaultProgress);
    });

    it('returns stored data when present', () => {
      const stored: LocalProgress = {
        completedChapters: {
          'ch-01': { stars: 3, completedAt: '2025-01-01T00:00:00.000Z' },
        },
        unlockedGenerals: ['guanyu'],
        xp: 500,
        level: 2,
      };
      mockStorage.setItem('wolong-progress', JSON.stringify(stored));

      const progress = getProgress();
      expect(progress).toEqual(stored);
    });

    it('handles corrupt JSON gracefully', () => {
      mockStorage.setItem('wolong-progress', '{not valid json!!!');

      const progress = getProgress();
      expect(progress).toEqual(defaultProgress);
    });

    it('returns default progress when window is undefined (server-side)', () => {
      // Temporarily make window undefined
      const origWindow = globalThis.window;
      // @ts-expect-error - deliberately setting window to undefined for SSR test
      delete globalThis.window;

      const progress = getProgress();
      expect(progress).toEqual(defaultProgress);

      // Restore
      globalThis.window = origWindow;
    });
  });

  describe('saveChapterProgress', () => {
    it('saves new chapter completion', () => {
      saveChapterProgress('ch-01', 2);

      const progress = getProgress();
      expect(progress.completedChapters['ch-01']).toBeDefined();
      expect(progress.completedChapters['ch-01'].stars).toBe(2);
    });

    it('records timestamp on save', () => {
      const before = new Date().toISOString();
      saveChapterProgress('ch-01', 3);
      const after = new Date().toISOString();

      const progress = getProgress();
      const completedAt = progress.completedChapters['ch-01'].completedAt;
      expect(completedAt >= before).toBe(true);
      expect(completedAt <= after).toBe(true);
    });

    it('only updates if higher stars', () => {
      saveChapterProgress('ch-01', 3);
      const firstTimestamp = getProgress().completedChapters['ch-01'].completedAt;

      saveChapterProgress('ch-01', 2);

      const progress = getProgress();
      expect(progress.completedChapters['ch-01'].stars).toBe(3);
      expect(progress.completedChapters['ch-01'].completedAt).toBe(firstTimestamp);
    });

    it('updates when new stars are higher', () => {
      saveChapterProgress('ch-01', 1);
      saveChapterProgress('ch-01', 3);

      const progress = getProgress();
      expect(progress.completedChapters['ch-01'].stars).toBe(3);
    });

    it('clamps stars to valid range (1-3)', () => {
      saveChapterProgress('ch-01', 5);
      expect(getProgress().completedChapters['ch-01'].stars).toBe(3);

      saveChapterProgress('ch-02', 0);
      expect(getProgress().completedChapters['ch-02'].stars).toBe(1);
    });
  });

  describe('addXP', () => {
    it('accumulates XP', () => {
      addXP(100);
      expect(getProgress().xp).toBe(100);

      addXP(150);
      expect(getProgress().xp).toBe(250);
    });

    it('recalculates level at 300 XP per level', () => {
      addXP(300);
      expect(getProgress().level).toBe(2);

      addXP(300);
      expect(getProgress().level).toBe(3);
    });

    it('calculates level correctly at boundaries', () => {
      addXP(299);
      expect(getProgress().level).toBe(1);

      addXP(1);
      expect(getProgress().level).toBe(2);
    });

    it('handles zero amount', () => {
      addXP(0);
      const progress = getProgress();
      expect(progress.xp).toBe(0);
      expect(progress.level).toBe(1);
    });

    it('handles negative amount', () => {
      addXP(500);
      addXP(-200);
      const progress = getProgress();
      expect(progress.xp).toBe(300);
      expect(progress.level).toBe(2);
    });
  });

  describe('unlockGenerals', () => {
    it('adds new generals', () => {
      unlockGenerals(['guanyu', 'zhangfei']);
      expect(getProgress().unlockedGenerals).toEqual(['guanyu', 'zhangfei']);
    });

    it('deduplicates existing generals', () => {
      unlockGenerals(['guanyu', 'zhangfei']);
      unlockGenerals(['guanyu', 'liubei']);

      const generals = getProgress().unlockedGenerals;
      expect(generals).toContain('guanyu');
      expect(generals).toContain('zhangfei');
      expect(generals).toContain('liubei');
      expect(generals.length).toBe(3);
    });

    it('handles empty array', () => {
      unlockGenerals([]);
      expect(getProgress().unlockedGenerals).toEqual([]);
    });
  });

  describe('isChapterUnlocked', () => {
    const sortedIds = ['ch-00', 'ch-01', 'ch-02', 'ch-03'];

    it('first chapter (index 0) is always unlocked', () => {
      expect(isChapterUnlocked('ch-00', sortedIds, {})).toBe(true);
    });

    it('requires previous chapter completed to unlock next', () => {
      const completed: Record<string, ChapterResult> = {
        'ch-00': { stars: 2, completedAt: '2025-01-01T00:00:00.000Z' },
      };
      expect(isChapterUnlocked('ch-01', sortedIds, completed)).toBe(true);
      expect(isChapterUnlocked('ch-02', sortedIds, completed)).toBe(false);
    });

    it('handles non-existent chapter id', () => {
      // indexOf returns -1 for unknown ids, and index <= 0 returns true
      expect(isChapterUnlocked('ch-unknown', sortedIds, {})).toBe(true);
    });

    it('unlocks chain of chapters when all previous are completed', () => {
      const completed: Record<string, ChapterResult> = {
        'ch-00': { stars: 3, completedAt: '2025-01-01T00:00:00.000Z' },
        'ch-01': { stars: 2, completedAt: '2025-01-02T00:00:00.000Z' },
        'ch-02': { stars: 1, completedAt: '2025-01-03T00:00:00.000Z' },
      };
      expect(isChapterUnlocked('ch-03', sortedIds, completed)).toBe(true);
    });
  });

  describe('resetProgress', () => {
    it('clears all progress from localStorage', () => {
      saveChapterProgress('ch-01', 3);
      addXP(500);
      unlockGenerals(['guanyu']);

      resetProgress();

      const progress = getProgress();
      expect(progress).toEqual(defaultProgress);
    });

    it('does nothing when window is undefined (server-side)', () => {
      const origWindow = globalThis.window;
      // @ts-expect-error - deliberately setting window to undefined for SSR test
      delete globalThis.window;

      // Should not throw
      expect(() => resetProgress()).not.toThrow();

      globalThis.window = origWindow;
    });
  });
});
