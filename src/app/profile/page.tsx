'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { getProgress, type LocalProgress } from '@/lib/progress';
import { StatsPanel } from '@/components/profile/StatsPanel';
import { AchievementList } from '@/components/profile/AchievementList';

/* ─── SVG Icons ──────────────────────────────────────────────────────── */

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5" />
      <polyline points="12,19 5,12 12,5" />
    </svg>
  );
}

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3L4 8v8c0 7.7 5.1 14.1 12 16 6.9-1.9 12-8.3 12-16V8L16 3z" />
      <path d="M12 16l3 3 5-6" />
    </svg>
  );
}

/* ─── XP Bar Component ───────────────────────────────────────────────── */

function XPBar({ xp, level }: { xp: number; level: number }) {
  const xpForCurrentLevel = (level - 1) * 300;
  const xpIntoLevel = xp - xpForCurrentLevel;
  const xpNeeded = 300;
  const progress = Math.min(xpIntoLevel / xpNeeded, 1);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-bamboo mb-1">
        <span>等级 {level}</span>
        <span>{xpIntoLevel} / {xpNeeded} XP</span>
      </div>
      <div className="h-3 rounded-full bg-bamboo/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
          transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-gold to-shu-red"
        />
      </div>
    </div>
  );
}

/* ─── Main Profile Page ──────────────────────────────────────────────── */

export default function ProfilePage() {
  const { data: session } = useSession();
  const [progress, setProgress] = useState<LocalProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  const playerName = session?.user?.name ?? '小军师';
  const playerImage = session?.user?.image;
  const initials = playerName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-parchment flex flex-col">
      {/* Top bar */}
      <div className="h-1.5 bg-gradient-to-r from-shu-red via-gold to-shu-red" />

      <header className="px-6 py-4 flex items-center gap-4 border-b border-bamboo/10 bg-white/50">
        <Link
          href="/map"
          className="flex items-center gap-1 text-sm font-semibold text-bamboo hover:text-ink transition-colors"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          返回地图
        </Link>
        <h1 className="text-xl font-bold text-ink flex-1 text-center pr-16">
          个人战绩
        </h1>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full flex flex-col gap-8">
        {/* ── Player Info Card ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-md border border-bamboo/10 flex flex-col items-center gap-4"
        >
          {/* Avatar */}
          <div className="relative">
            {playerImage ? (
              <img
                src={playerImage}
                alt={playerName}
                className="w-20 h-20 rounded-full border-3 border-gold object-cover shadow-lg"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-20 h-20 rounded-full border-3 border-gold bg-shu-red flex items-center justify-center shadow-lg">
                <span className="text-2xl font-black text-white">{initials}</span>
              </div>
            )}
            {/* Level badge */}
            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-gold flex items-center justify-center border-2 border-white shadow">
              <span className="text-xs font-black text-white">
                {progress?.level ?? 1}
              </span>
            </div>
          </div>

          {/* Name & title */}
          <div className="text-center">
            <h2 className="text-2xl font-black text-ink">{playerName}</h2>
            <p className="text-sm text-bamboo mt-0.5 flex items-center justify-center gap-1.5">
              <ShieldIcon className="w-4 h-4 text-gold" />
              {getLevelTitle(progress?.level ?? 1)}
            </p>
          </div>

          {/* XP bar */}
          {progress && (
            <div className="w-full max-w-xs">
              <XPBar xp={progress.xp} level={progress.level} />
            </div>
          )}
        </motion.div>

        {/* ── Stats Panel ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.4 }}
        >
          <h3 className="text-lg font-bold text-ink mb-3">战绩一览</h3>
          <StatsPanel />
        </motion.div>

        {/* ── Achievement List ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <AchievementList />
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-6 text-center border-t border-bamboo/10">
        <p className="text-xs text-bamboo/50">
          卧龙学堂 &copy; 2026
        </p>
      </footer>

      <div className="h-1.5 bg-gradient-to-r from-shu-red via-gold to-shu-red" />
    </div>
  );
}

/* ─── Helper: Level Titles ───────────────────────────────────────────── */

function getLevelTitle(level: number): string {
  if (level >= 20) return '天下霸主';
  if (level >= 15) return '大都督';
  if (level >= 10) return '军师中郎将';
  if (level >= 7) return '参谋';
  if (level >= 5) return '校尉';
  if (level >= 3) return '伍长';
  return '新兵';
}
