'use client';

import { motion } from 'framer-motion';

interface SoldierGroupProps {
  count: number;
  side: 'left' | 'right';
  qiPercent: number;
}

/**
 * Renders a formation of small soldier dots that advance toward the center
 * as qiPercent increases. Player soldiers are Shu red; enemy soldiers are gray.
 */
export function SoldierGroup({ count, side, qiPercent }: SoldierGroupProps) {
  const isPlayer = side === 'left';
  const clampedQi = Math.min(100, Math.max(0, qiPercent));

  // Player soldiers advance right as qi increases; enemies get pushed back
  const advanceX = isPlayer
    ? (clampedQi / 100) * 60   // advance up to 60px right
    : -(clampedQi / 100) * 30; // pushed back up to 30px

  // Number of visible dots (max 12 for visual simplicity)
  const displayCount = Math.min(count, 12);
  const rows = Math.ceil(displayCount / 4);

  const dotColor = isPlayer ? 'var(--color-shu-red)' : '#777';
  const dotBorder = isPlayer ? 'var(--color-gold)' : '#999';

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      animate={{ x: advanceX }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      {/* Soldier dot grid */}
      <div className="flex flex-col gap-1">
        {Array.from({ length: rows }).map((_, rowIdx) => (
          <div key={rowIdx} className="flex gap-1">
            {Array.from({ length: Math.min(4, displayCount - rowIdx * 4) }).map((_, colIdx) => (
              <motion.div
                key={colIdx}
                className="rounded-full border"
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: dotColor,
                  borderColor: dotBorder,
                }}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: (rowIdx * 4 + colIdx) * 0.03 }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Count label */}
      <span
        className="text-xs font-bold select-none"
        style={{
          color: isPlayer ? 'var(--color-shu-red)' : '#666',
          fontFamily: 'serif',
        }}
      >
        &times;{count}
      </span>
    </motion.div>
  );
}
