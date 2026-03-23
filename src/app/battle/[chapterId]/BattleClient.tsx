'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLevelEngine } from '@/lib/engine/useLevelEngine';
import { BattleScene } from '@/components/battle/BattleScene';
import { saveChapterProgress, addXP, unlockGenerals, isChapterUnlocked, getProgress } from '@/lib/progress';
import { chapters as allChapters } from '@/lib/levels';
import type { Chapter } from '@/lib/levels/types';

export function BattleClient({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialChallenge = Math.min(
    parseInt(searchParams.get('c') || '0', 10) || 0,
    chapter.challenges.length - 1
  );
  const engine = useLevelEngine(chapter, initialChallenge);
  const [accessState, setAccessState] = useState<'loading' | 'granted' | 'locked'>('loading');

  // Check if chapter is unlocked (debug mode bypasses)
  const isDebug = searchParams.get('debug') === '1';
  useEffect(() => {
    if (isDebug) {
      setAccessState('granted');
      return;
    }
    const sortedIds = Object.values(allChapters)
      .sort((a, b) => a.act !== b.act ? a.act - b.act : a.id.localeCompare(b.id))
      .map(c => c.id);
    const progress = getProgress();
    if (isChapterUnlocked(chapter.id, sortedIds, progress.completedChapters)) {
      setAccessState('granted');
    } else {
      setAccessState('locked');
    }
  }, [chapter.id, isDebug]);

  // Sync challenge index to URL query param for refresh persistence
  useEffect(() => {
    const idx = engine.state.currentChallengeIndex;
    const url = idx > 0 ? `/battle/${chapter.id}?c=${idx}` : `/battle/${chapter.id}`;
    window.history.replaceState(null, '', url);
  }, [engine.state.currentChallengeIndex, chapter.id]);

  if (accessState === 'locked') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--color-parchment)' }}>
        <p className="text-lg" style={{ color: 'var(--color-ink)', fontFamily: 'serif' }}>此关卡尚未解锁，请先完成前面的关卡。</p>
        <button
          onClick={() => router.push('/map')}
          className="px-6 py-2 rounded-lg font-bold cursor-pointer"
          style={{ backgroundColor: 'var(--color-shu-red)', color: 'white', fontFamily: 'serif' }}
        >
          返回地图
        </button>
      </div>
    );
  }

  if (accessState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-parchment)' }}>
        <p style={{ color: 'var(--color-ink)', fontFamily: 'serif' }}>军师正在布阵...</p>
      </div>
    );
  }

  const handleNextPhase = () => {
    if (engine.state.phase === 'victory') {
      // Save progress and navigate on first "继续" click (no separate rewards phase)
      saveChapterProgress(chapter.id, engine.state.stars);
      addXP(chapter.rewards.xp);
      if (chapter.rewards.unlockGenerals) {
        unlockGenerals(chapter.rewards.unlockGenerals);
      }

      fetch('/api/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chapterId: chapter.id,
          stars: engine.state.stars,
          xpGained: chapter.rewards.xp,
          unlockedGenerals: chapter.rewards.unlockGenerals,
          unlockedItems: chapter.rewards.unlockItems,
        }),
      });
      router.push('/map');
    } else {
      engine.nextPhase();
    }
  };

  return (
    <BattleScene
      chapter={chapter}
      phase={engine.state.phase}
      qiPercent={engine.state.qiPercent}
      currentChallenge={engine.currentChallenge}
      errorMessage={engine.state.errorMessage}
      errorLine={engine.state.errorLine}
      lastCode={engine.state.lastCorrectCode}
      lastOutput={engine.state.lastCorrectOutput}
      rewards={engine.rewards}
      stars={engine.state.stars}
      currentHint={engine.state.currentHint}
      onSubmitCode={engine.submitCode}
      onNextPhase={handleNextPhase}
      onUseHint={engine.useHint}
    />
  );
}
