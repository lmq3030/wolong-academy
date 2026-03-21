'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { concepts } from '@/lib/levels/concepts';
import { getProgress, type LocalProgress } from '@/lib/progress';
import { ConceptCard } from '@/components/study/ConceptCard';

/* ---------- Act section metadata ---------- */

const ACT_SECTIONS: { act: number; title: string; subtitle: string }[] = [
  { act: 1, title: '第一卷：群雄并起', subtitle: 'Act I — Rise of Heroes' },
  { act: 2, title: '第二卷：卧龙出山', subtitle: 'Act II — The Sleeping Dragon Awakens' },
  { act: 3, title: '第三卷：五虎上将', subtitle: 'Act III — Five Tiger Generals' },
  { act: 4, title: '第四卷：鞠躬尽瘁', subtitle: 'Act IV — Devotion unto Death' },
];

/* ---------- Component ---------- */

export default function StudyPage() {
  const [progress, setProgress] = useState<LocalProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // Loading state
  if (!progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment">
        <p className="text-bamboo">加载中...</p>
      </div>
    );
  }

  // A concept is unlocked if the player has completed the chapter that teaches it
  const isConceptUnlocked = (chapterId: string) =>
    chapterId in progress.completedChapters;

  // Group concepts by act
  const conceptsByAct = new Map<number, typeof concepts>();
  for (const c of concepts) {
    const existing = conceptsByAct.get(c.act) ?? [];
    existing.push(c);
    conceptsByAct.set(c.act, existing);
  }

  const unlockedCount = concepts.filter((c) =>
    isConceptUnlocked(c.unlockedByChapter),
  ).length;

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-bamboo/20 bg-parchment/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/map"
            className="flex items-center gap-1.5 text-sm font-medium text-bamboo transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            征途地图
          </Link>
          <div className="text-center">
            <h1 className="text-xl font-bold text-ink sm:text-2xl">兵书阁</h1>
          </div>
          {/* Spacer to center the title */}
          <div className="w-16" />
        </div>
      </header>

      <main className="flex-1">
        <motion.div
          className="mx-auto max-w-3xl px-4 py-6 sm:px-6"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Subtitle area */}
          <div className="mb-8 text-center">
            <p className="text-sm text-bamboo sm:text-base">
              已习得的Python兵法
            </p>
            <p className="mt-1 text-xs text-bamboo/60">
              {unlockedCount} / {concepts.length} 卷已解锁
            </p>
          </div>

          {/* Act sections */}
          {ACT_SECTIONS.map(({ act, title, subtitle }, sectionIdx) => {
            const actConcepts = conceptsByAct.get(act);
            if (!actConcepts || actConcepts.length === 0) return null;

            return (
              <motion.section
                key={act}
                className="mb-10"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: sectionIdx * 0.08 }}
              >
                {/* Act header — styled like a scroll section divider */}
                <div className="mb-4 flex items-center gap-3">
                  <div className="h-px flex-1 bg-bamboo/20" />
                  <div className="text-center">
                    <h2 className="text-base font-bold tracking-wide text-ink sm:text-lg">
                      {title}
                    </h2>
                    <p className="text-[10px] text-bamboo/50 sm:text-xs">
                      {subtitle}
                    </p>
                  </div>
                  <div className="h-px flex-1 bg-bamboo/20" />
                </div>

                {/* Concept cards */}
                <div className="flex flex-col gap-3">
                  {actConcepts.map((concept, cardIdx) => (
                    <motion.div
                      key={concept.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: sectionIdx * 0.08 + cardIdx * 0.05,
                      }}
                    >
                      <ConceptCard
                        concept={concept}
                        isUnlocked={isConceptUnlocked(concept.unlockedByChapter)}
                      />
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            );
          })}

          {/* Footer note */}
          <p className="mt-4 text-center text-xs text-bamboo/40">
            完成更多关卡，解锁新的兵法！
          </p>
        </motion.div>
      </main>
    </div>
  );
}

/* ---- Inline SVG icon ---- */

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}
