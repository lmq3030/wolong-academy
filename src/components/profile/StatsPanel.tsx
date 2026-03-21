'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { getProgress, type LocalProgress } from '@/lib/progress';
import { chapters } from '@/lib/levels';
import { generals } from '@/lib/generals';

/* ─── SVG Icon Components ────────────────────────────────────────────── */

function FortressIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="14" width="24" height="14" rx="1" />
      <path d="M4 14l12-10 12 10" />
      <rect x="13" y="20" width="6" height="8" />
      <rect x="6" y="8" width="4" height="4" />
      <rect x="22" y="8" width="4" height="4" />
    </svg>
  );
}

function HelmetIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 18c0-5.5 4.5-12 10-12s10 6.5 10 12" />
      <path d="M4 18h24v4c0 2-2 4-4 4H8c-2 0-4-2-4-4v-4z" />
      <path d="M16 6v-2" />
      <path d="M10 18v-4c0-3.3 2.7-6 6-6s6 2.7 6 6v4" />
    </svg>
  );
}

function MedalIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="16" cy="20" r="8" />
      <path d="M11 4h4l1 8" />
      <path d="M21 4h-4l-1 8" />
      <path d="M13 18l3 2 3-2" />
      <path d="M16 20v4" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor" stroke="currentColor" strokeWidth={1} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 2l4.5 9.1 10 1.5-7.2 7 1.7 10L16 25l-9 4.6 1.7-10-7.2-7 10-1.5z" />
    </svg>
  );
}

/* ─── Animated Counter ───────────────────────────────────────────────── */

function AnimatedNumber({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    if (value === 0) { setDisplay(0); return; }

    const duration = 800; // ms
    const steps = 30;
    const stepTime = duration / steps;
    let current = 0;
    const increment = value / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{display}{suffix}</span>;
}

/* ─── Stats Data Computation ─────────────────────────────────────────── */

function computeStats(progress: LocalProgress) {
  const totalChapters = Object.keys(chapters).length;
  const completedCount = Object.keys(progress.completedChapters).length;
  const unlockedGeneralsCount = progress.unlockedGenerals.length;
  const totalGenerals = generals.length;
  const totalXP = progress.xp;

  // Average stars
  const chapterResults = Object.values(progress.completedChapters);
  const avgStars = chapterResults.length > 0
    ? Math.round((chapterResults.reduce((sum, r) => sum + r.stars, 0) / chapterResults.length) * 10) / 10
    : 0;

  return { totalChapters, completedCount, unlockedGeneralsCount, totalGenerals, totalXP, avgStars };
}

/* ─── Stat Card Component ────────────────────────────────────────────── */

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  suffix?: string;
  detail: string;
  color: string;
  bgColor: string;
  index: number;
}

function StatCard({ icon, label, value, suffix, detail, color, bgColor, index }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 + 0.2, duration: 0.4, ease: 'easeOut' }}
      className="flex flex-col items-center gap-2 bg-white rounded-2xl p-6 shadow-md border border-bamboo/10"
    >
      <div className={`w-12 h-12 rounded-xl ${bgColor} flex items-center justify-center`}>
        <div className={`w-6 h-6 ${color}`}>{icon}</div>
      </div>
      <span className={`text-3xl font-black ${color}`}>
        <AnimatedNumber value={value} suffix={suffix} />
      </span>
      <span className="text-sm font-bold text-ink">{label}</span>
      <span className="text-xs text-bamboo/70">{detail}</span>
    </motion.div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────── */

export function StatsPanel() {
  const [progress, setProgress] = useState<LocalProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  if (!progress) return null;

  const stats = computeStats(progress);

  const cards: Omit<StatCardProps, 'index'>[] = [
    {
      icon: <FortressIcon className="w-6 h-6" />,
      label: '攻城数',
      value: stats.completedCount,
      detail: `共 ${stats.totalChapters} 座城池`,
      color: 'text-shu-red',
      bgColor: 'bg-shu-red/10',
    },
    {
      icon: <HelmetIcon className="w-6 h-6" />,
      label: '麾下武将',
      value: stats.unlockedGeneralsCount,
      detail: `共 ${stats.totalGenerals} 位名将`,
      color: 'text-wei-blue',
      bgColor: 'bg-wei-blue/10',
    },
    {
      icon: <MedalIcon className="w-6 h-6" />,
      label: '战功',
      value: stats.totalXP,
      suffix: ' XP',
      detail: '累计经验值',
      color: 'text-gold',
      bgColor: 'bg-gold/10',
    },
    {
      icon: <StarIcon className="w-6 h-6" />,
      label: '平均战评',
      value: stats.avgStars,
      detail: stats.completedCount > 0 ? '满分 3.0' : '尚未完成关卡',
      color: 'text-wu-green',
      bgColor: 'bg-wu-green/10',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {cards.map((card, i) => (
        <StatCard key={card.label} {...card} index={i} />
      ))}
    </div>
  );
}
