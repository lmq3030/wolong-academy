'use client';

import { motion } from 'framer-motion';
import type { General } from '@/lib/generals';
import { factionMeta } from '@/lib/generals';

interface GeneralCardProps {
  general: General;
  isUnlocked: boolean;
  onClick: () => void;
}

/**
 * Faction-to-gradient mapping for the portrait background circle.
 * Each faction gets a distinct radial gradient to make the card
 * feel like a collectible trading card.
 */
const factionGradients: Record<string, string> = {
  shu: 'from-shu-red/30 via-shu-red/10 to-transparent',
  wei: 'from-wei-blue/30 via-wei-blue/10 to-transparent',
  wu: 'from-wu-green/30 via-wu-green/10 to-transparent',
  other: 'from-bamboo/30 via-bamboo/10 to-transparent',
};

export function GeneralCard({ general, isUnlocked, onClick }: GeneralCardProps) {
  const meta = factionMeta[general.faction];
  // Display the first character of the name as a large placeholder portrait
  const portraitChar = general.name[0];

  if (!isUnlocked) {
    return (
      <div className="flex flex-col items-center rounded-xl border-2 border-bamboo/20 bg-parchment/60 p-3 sm:p-4 opacity-60 cursor-default select-none">
        {/* Locked portrait circle */}
        <div className="relative mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-bamboo/10 sm:h-24 sm:w-24">
          <span className="text-4xl font-bold text-bamboo/40 sm:text-5xl">?</span>
        </div>

        {/* Name placeholder */}
        <span className="mb-1 text-base font-semibold text-bamboo/40 sm:text-lg">???</span>

        {/* Unlock hint */}
        <span className="text-[10px] text-bamboo/40 sm:text-xs">完成关卡解锁</span>
      </div>
    );
  }

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative flex flex-col items-center rounded-xl border-2 ${meta.border} bg-white p-3 shadow-sm transition-shadow hover:shadow-lg hover:shadow-${general.faction === 'shu' ? 'shu-red' : general.faction === 'wei' ? 'wei-blue' : general.faction === 'wu' ? 'wu-green' : 'bamboo'}/20 sm:p-4 cursor-pointer select-none`}
    >
      {/* Faction badge (top-right) */}
      <span
        className={`absolute right-2 top-2 rounded-md px-1.5 py-0.5 text-[10px] font-bold text-white sm:text-xs`}
        style={{ backgroundColor: meta.color }}
      >
        {meta.label}
      </span>

      {/* Portrait circle with faction gradient */}
      <div
        className={`relative mb-2 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-radial ${factionGradients[general.faction]} sm:h-24 sm:w-24`}
        style={{
          background: `radial-gradient(circle, ${meta.color}25 0%, ${meta.color}08 60%, transparent 100%)`,
        }}
      >
        <span
          className="text-4xl font-black sm:text-5xl"
          style={{ color: meta.color }}
        >
          {portraitChar}
        </span>

        {/* Decorative ring */}
        <div
          className="absolute inset-0 rounded-full border-2 opacity-30"
          style={{ borderColor: meta.color }}
        />
      </div>

      {/* Name */}
      <span className="mb-0.5 text-base font-bold text-ink sm:text-lg">
        {general.name}
      </span>

      {/* Trait */}
      <span
        className="mb-1 text-xs font-medium sm:text-sm"
        style={{ color: meta.color }}
      >
        {general.traits}
      </span>

      {/* Skill badge */}
      <span
        className="rounded-full px-2 py-0.5 text-[10px] font-semibold text-white sm:text-xs"
        style={{ backgroundColor: meta.color }}
      >
        {general.skillName}
      </span>
    </motion.button>
  );
}
