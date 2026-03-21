'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { General } from '@/lib/generals';
import { factionMeta } from '@/lib/generals';

interface GeneralDetailProps {
  general: General | null;
  onClose: () => void;
}

export function GeneralDetail({ general, onClose }: GeneralDetailProps) {
  return (
    <AnimatePresence>
      {general && (
        <motion.div
          key="general-detail-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-ink/50"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal card */}
          <motion.div
            className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border-2 bg-parchment shadow-2xl"
            style={{ borderColor: factionMeta[general.faction].color }}
            initial={{ scale: 0.8, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: 30 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {/* Top decorative bar */}
            <div
              className="h-2 w-full"
              style={{ backgroundColor: factionMeta[general.faction].color }}
            />

            <div className="flex flex-col items-center px-6 py-6 sm:px-8 sm:py-8">
              {/* Portrait circle */}
              <div
                className="mb-4 flex h-28 w-28 items-center justify-center rounded-full border-4 sm:h-32 sm:w-32"
                style={{
                  borderColor: factionMeta[general.faction].color,
                  background: `radial-gradient(circle, ${factionMeta[general.faction].color}20 0%, ${factionMeta[general.faction].color}08 60%, transparent 100%)`,
                }}
              >
                <span
                  className="text-6xl font-black sm:text-7xl"
                  style={{ color: factionMeta[general.faction].color }}
                >
                  {general.name[0]}
                </span>
              </div>

              {/* Name + Title */}
              <h2 className="mb-1 text-center text-2xl font-black text-ink sm:text-3xl">
                {general.name}
                {general.title && (
                  <span className="ml-2 text-lg font-medium text-bamboo sm:text-xl">
                    — {general.title}
                  </span>
                )}
              </h2>

              {/* Faction badge */}
              <span
                className="mb-4 rounded-full px-3 py-1 text-xs font-bold text-white sm:text-sm"
                style={{ backgroundColor: factionMeta[general.faction].color }}
              >
                {factionMeta[general.faction].label}
              </span>

              {/* Core trait — large display */}
              <div className="mb-4 flex flex-col items-center">
                <span className="text-xs font-medium uppercase tracking-widest text-bamboo">
                  核心特质
                </span>
                <span
                  className="mt-1 text-4xl font-black sm:text-5xl"
                  style={{ color: factionMeta[general.faction].color }}
                >
                  {general.traits}
                </span>
              </div>

              {/* Info rows */}
              <div className="mb-4 w-full space-y-2">
                {general.weapon && (
                  <InfoRow label="兵器" value={general.weapon} color={factionMeta[general.faction].color} />
                )}
                <InfoRow
                  label="技能"
                  value={general.skillName}
                  color={factionMeta[general.faction].color}
                />
              </div>

              {/* Famous quote */}
              {general.quote && (
                <blockquote className="mb-4 w-full rounded-lg border-l-4 bg-bamboo/5 px-4 py-3" style={{ borderLeftColor: factionMeta[general.faction].color }}>
                  <p className="text-sm italic leading-relaxed text-ink/80 sm:text-base" style={{ fontFamily: '"STKaiti", "KaiTi", "楷体", serif' }}>
                    &ldquo;{general.quote}&rdquo;
                  </p>
                </blockquote>
              )}

              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                className="mt-2 rounded-lg border-2 px-6 py-2 text-sm font-bold transition-colors hover:bg-ink/5 sm:text-base"
                style={{
                  borderColor: factionMeta[general.faction].color,
                  color: factionMeta[general.faction].color,
                }}
              >
                关闭
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-white/60 px-4 py-2">
      <span
        className="shrink-0 rounded px-2 py-0.5 text-xs font-bold text-white"
        style={{ backgroundColor: color }}
      >
        {label}
      </span>
      <span className="text-sm font-semibold text-ink sm:text-base">{value}</span>
    </div>
  );
}
