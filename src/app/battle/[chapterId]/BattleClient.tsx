'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLevelEngine } from '@/lib/engine/useLevelEngine';
import { BattleScene } from '@/components/battle/BattleScene';
import { saveChapterProgress, addXP, unlockGenerals, isChapterUnlocked, getProgress } from '@/lib/progress';
import { chapters as allChapters } from '@/lib/levels';
import type { Chapter } from '@/lib/levels/types';

export function BattleClient({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  const engine = useLevelEngine(chapter);
  const [accessChecked, setAccessChecked] = useState(false);

  // Check if chapter is unlocked — redirect to map if not
  useEffect(() => {
    const sortedIds = Object.values(allChapters)
      .sort((a, b) => a.act !== b.act ? a.act - b.act : a.id.localeCompare(b.id))
      .map(c => c.id);
    const progress = getProgress();
    if (!isChapterUnlocked(chapter.id, sortedIds, progress.completedChapters)) {
      router.replace('/map');
    } else {
      setAccessChecked(true);
    }
  }, [chapter.id, router]);

  if (!accessChecked) {
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
