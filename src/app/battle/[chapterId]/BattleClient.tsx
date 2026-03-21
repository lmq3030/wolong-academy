'use client';

import { useRouter } from 'next/navigation';
import { useLevelEngine } from '@/lib/engine/useLevelEngine';
import { BattleScene } from '@/components/battle/BattleScene';
import type { Chapter } from '@/lib/levels/types';

export function BattleClient({ chapter }: { chapter: Chapter }) {
  const router = useRouter();
  const engine = useLevelEngine(chapter);

  const handleNextPhase = () => {
    if (engine.state.phase === 'rewards') {
      // Save progress (placeholder until DB is connected)
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
      rewards={engine.rewards}
      stars={engine.state.stars}
      currentHint={engine.state.currentHint}
      onSubmitCode={engine.submitCode}
      onNextPhase={handleNextPhase}
      onUseHint={engine.useHint}
    />
  );
}
