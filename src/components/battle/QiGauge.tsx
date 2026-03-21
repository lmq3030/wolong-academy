'use client';

import { motion } from 'framer-motion';

interface QiGaugeProps {
  percent: number;
  isReady: boolean;
}

export function QiGauge({ percent, isReady }: QiGaugeProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <div className="relative flex flex-col items-center" style={{ width: 40, height: '100%' }}>
      {/* Label */}
      <span
        className="text-lg font-bold text-gold z-10 mb-1 select-none"
        style={{ fontFamily: 'serif' }}
      >
        气
      </span>

      {/* Gauge track */}
      <div className="relative flex-1 w-full rounded-full overflow-hidden bg-black/40 border border-gold/40">
        {/* Fill */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 rounded-full"
          style={{
            background: `linear-gradient(to top, var(--color-shu-red), var(--color-gold))`,
          }}
          initial={{ height: '0%' }}
          animate={{ height: `${clampedPercent}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        />

        {/* Ready glow */}
        {isReady && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              background: `linear-gradient(to top, var(--color-shu-red), var(--color-gold))`,
              boxShadow: '0 0 16px var(--color-gold), 0 0 32px var(--color-gold)',
            }}
            animate={{
              opacity: [0.7, 1, 0.7],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        )}

        {/* Percentage label positioned at fill level */}
        <motion.div
          className="absolute left-0 right-0 flex items-center justify-center pointer-events-none"
          animate={{ bottom: `${Math.max(2, clampedPercent - 6)}%` }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <span className="text-[10px] font-bold text-white drop-shadow-md">
            {Math.round(clampedPercent)}%
          </span>
        </motion.div>
      </div>
    </div>
  );
}
