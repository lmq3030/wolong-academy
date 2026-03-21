'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getProgress, type LocalProgress } from '@/lib/progress';
import { chapters } from '@/lib/levels';
import { generals } from '@/lib/generals';

/* ─── SVG Icon Components ────────────────────────────────────────────── */

function TrophyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 2h12v6a6 6 0 0 1-12 0V2z" />
      <path d="M6 4H3v2a3 3 0 0 0 3 3" />
      <path d="M18 4h3v2a3 3 0 0 1-3 3" />
      <path d="M12 14v4" />
      <path d="M8 22h8" />
      <path d="M8 22v-4h8v4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  );
}

function LockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </svg>
  );
}

/* ─── Achievement Definitions ────────────────────────────────────────── */

interface Achievement {
  id: string;
  name: string;
  description: string;
  condition: (p: LocalProgress) => boolean;
}

const shuGeneralIds = generals.filter((g) => g.faction === 'shu').map((g) => g.id);

const achievements: Achievement[] = [
  {
    id: 'peach-oath',
    name: '桃园之誓',
    description: '完成第一关',
    condition: (p) => 'chapter-00' in p.completedChapters,
  },
  {
    id: 'act1-complete',
    name: '初出茅庐',
    description: '完成第一卷所有关卡',
    condition: (p) => {
      const act1Chapters = Object.entries(chapters).filter(([, c]) => c.act === 1);
      return act1Chapters.length > 0 && act1Chapters.every(([id]) => id in p.completedChapters);
    },
  },
  {
    id: 'red-cliffs',
    name: '赤壁大捷',
    description: '击败赤壁之战Boss关',
    condition: (p) => {
      // Find any chapter in act 2 that is a boss-like chapter (last chapter in act 2)
      const act2Chapters = Object.entries(chapters)
        .filter(([, c]) => c.act === 2)
        .sort(([a], [b]) => a.localeCompare(b));
      if (act2Chapters.length === 0) return false;
      const lastAct2 = act2Chapters[act2Chapters.length - 1][0];
      return lastAct2 in p.completedChapters;
    },
  },
  {
    id: 'five-tigers',
    name: '五虎上将',
    description: '收集所有蜀汉武将',
    condition: (p) => shuGeneralIds.every((id) => p.unlockedGenerals.includes(id)),
  },
  {
    id: 'three-kingdoms',
    name: '天下三分',
    description: '完成全部四卷',
    condition: (p) => {
      const allChapterIds = Object.keys(chapters);
      return allChapterIds.length > 0 && allChapterIds.every((id) => id in p.completedChapters);
    },
  },
  {
    id: 'perfect-10',
    name: '十全十美',
    description: '任意10关获得三星评价',
    condition: (p) => {
      const threeStarCount = Object.values(p.completedChapters).filter((r) => r.stars === 3).length;
      return threeStarCount >= 10;
    },
  },
  {
    id: 'collector',
    name: '武将收藏家',
    description: '收集10位武将',
    condition: (p) => p.unlockedGenerals.length >= 10,
  },
  {
    id: 'scholar',
    name: '博学多才',
    description: '在兵书阁查看所有已解锁概念',
    condition: () => {
      // This would need a separate tracking mechanism for concepts viewed.
      // For MVP, check if all chapters are completed (implying concepts are known).
      if (typeof window === 'undefined') return false;
      try {
        const viewed = localStorage.getItem('wolong-concepts-viewed');
        if (!viewed) return false;
        const viewedSet: string[] = JSON.parse(viewed);
        const allConcepts = Object.values(chapters).map((c) => c.pythonConcept);
        return allConcepts.every((concept) => viewedSet.includes(concept));
      } catch {
        return false;
      }
    },
  },
];

/* ─── Achievement Item ───────────────────────────────────────────────── */

function AchievementItem({
  achievement,
  unlocked,
  index,
}: {
  achievement: Achievement;
  unlocked: boolean;
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06 + 0.3, duration: 0.35 }}
      className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
        unlocked
          ? 'bg-white border-gold/40 shadow-sm'
          : 'bg-bamboo/5 border-bamboo/10'
      }`}
    >
      {/* Badge */}
      <div
        className={`flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center ${
          unlocked
            ? 'bg-gold/20 border-2 border-gold'
            : 'bg-bamboo/10 border-2 border-bamboo/20'
        }`}
      >
        {unlocked ? (
          <TrophyIcon className="w-5 h-5 text-gold" />
        ) : (
          <LockIcon className="w-5 h-5 text-bamboo/40" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <h4
          className={`text-sm font-bold ${
            unlocked ? 'text-ink' : 'text-bamboo/60'
          }`}
        >
          {achievement.name}
        </h4>
        <p
          className={`text-xs mt-0.5 ${
            unlocked ? 'text-bamboo' : 'text-bamboo/40'
          }`}
        >
          {unlocked ? achievement.description : '???'}
        </p>
      </div>

      {/* Checkmark */}
      {unlocked && (
        <div className="flex-shrink-0 w-7 h-7 rounded-full bg-wu-green/15 flex items-center justify-center">
          <CheckIcon className="w-4 h-4 text-wu-green" />
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export function AchievementList() {
  const [progress, setProgress] = useState<LocalProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null;

  const unlockedCount = achievements.filter((a) => a.condition(progress)).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-ink">成就</h3>
        <span className="text-sm font-semibold text-bamboo">
          已达成 {unlockedCount}/{achievements.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 rounded-full bg-bamboo/10 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(unlockedCount / achievements.length) * 100}%` }}
          transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
          className="h-full rounded-full bg-gradient-to-r from-gold to-shu-red"
        />
      </div>

      {/* Achievement items */}
      <div className="flex flex-col gap-2">
        {achievements.map((achievement, i) => (
          <AchievementItem
            key={achievement.id}
            achievement={achievement}
            unlocked={achievement.condition(progress)}
            index={i}
          />
        ))}
      </div>
    </div>
  );
}
