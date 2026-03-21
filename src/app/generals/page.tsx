'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getGeneralsByFaction, factionMeta, type General, type Faction } from '@/lib/generals';
import { getProgress } from '@/lib/progress';
import { GeneralCard } from '@/components/generals/GeneralCard';
import { GeneralDetail } from '@/components/generals/GeneralDetail';

const FACTION_ORDER: Faction[] = ['shu', 'wei', 'wu', 'other'];

export default function GeneralsPage() {
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [selectedGeneral, setSelectedGeneral] = useState<General | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const progress = getProgress();
    setUnlocked(new Set(progress.unlockedGenerals));
    setMounted(true);
  }, []);

  const grouped = getGeneralsByFaction();
  const totalCount = Object.values(grouped).reduce((n, arr) => n + arr.length, 0);
  const unlockedCount = unlocked.size;

  return (
    <div className="min-h-screen bg-parchment">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-bamboo/20 bg-parchment/95 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm font-medium text-bamboo transition-colors hover:text-ink"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            <span>返回</span>
          </Link>

          <h1 className="text-xl font-black text-ink sm:text-2xl">
            武将图鉴
          </h1>

          {/* Collection counter */}
          <div className="flex items-center gap-1.5 text-sm text-bamboo">
            <ShieldIcon className="h-4 w-4" />
            <span className="font-bold">
              {mounted ? unlockedCount : '-'}/{totalCount}
            </span>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-5xl px-4 pb-12 pt-6 sm:px-6">
        {FACTION_ORDER.map((faction, factionIdx) => {
          const meta = factionMeta[faction];
          const factionGenerals = grouped[faction];
          if (factionGenerals.length === 0) return null;

          return (
            <motion.section
              key={faction}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: factionIdx * 0.1, duration: 0.4 }}
              className="mb-8"
            >
              {/* Faction header */}
              <div className="mb-4 flex items-center gap-3">
                <div
                  className="h-6 w-1.5 rounded-full"
                  style={{ backgroundColor: meta.color }}
                />
                <h2
                  className="text-lg font-bold sm:text-xl"
                  style={{ color: meta.color }}
                >
                  {meta.label}
                </h2>
                <span className="text-xs text-bamboo">
                  ({factionGenerals.filter((g) => unlocked.has(g.id)).length}/{factionGenerals.length})
                </span>
                <div className="flex-1 border-b border-bamboo/15" />
              </div>

              {/* Card grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 sm:gap-4">
                {factionGenerals.map((general, idx) => (
                  <motion.div
                    key={general.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      delay: factionIdx * 0.1 + idx * 0.04,
                      duration: 0.3,
                    }}
                  >
                    <GeneralCard
                      general={general}
                      isUnlocked={unlocked.has(general.id)}
                      onClick={() => setSelectedGeneral(general)}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>
          );
        })}

        {/* Hint for unlocking */}
        {mounted && unlockedCount === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-4 rounded-xl border border-gold/30 bg-gold/5 px-6 py-4 text-center"
          >
            <p className="text-sm text-bamboo">
              完成关卡即可解锁武将！前往{' '}
              <Link href="/" className="font-bold text-shu-red underline underline-offset-2">
                冒险地图
              </Link>{' '}
              开始征程。
            </p>
          </motion.div>
        )}
      </main>

      {/* Detail modal */}
      <GeneralDetail
        general={selectedGeneral}
        onClose={() => setSelectedGeneral(null)}
      />
    </div>
  );
}

/* ── Inline SVG icons ──────────────────────────────────────────────────── */

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
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
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
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}
