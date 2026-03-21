'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ChapterRewards } from '@/lib/levels/types';

interface VictoryScreenProps {
  rewards: ChapterRewards;
  stars: number;
  onContinue: () => void;
}

function StarIcon({ filled, delay }: { filled: boolean; delay: number }) {
  return (
    <motion.div
      className="text-5xl select-none"
      initial={{ scale: 0, rotate: -180, opacity: 0 }}
      animate={
        filled
          ? { scale: 1, rotate: 0, opacity: 1 }
          : { scale: 1, rotate: 0, opacity: 0.25 }
      }
      transition={{
        delay,
        duration: 0.5,
        type: 'spring',
        stiffness: 200,
      }}
    >
      <svg width="48" height="48" viewBox="0 0 24 24" fill={filled ? 'var(--color-gold)' : '#ccc'}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    </motion.div>
  );
}

function CountUpNumber({ target, duration = 1500 }: { target: number; duration?: number }) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (target <= 0) return;

    const startTime = Date.now();
    const frame = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(Math.round(eased * target));

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };
    requestAnimationFrame(frame);
  }, [target, duration]);

  return <>{current}</>;
}

export function VictoryScreen({ rewards, stars, onContinue }: VictoryScreenProps) {
  const clampedStars = Math.min(3, Math.max(0, stars));

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(212,168,67,0.2), rgba(245,240,232,0.98))',
        }}
      />

      {/* Content card */}
      <motion.div
        className="relative z-10 w-full max-w-md mx-6 rounded-xl p-8 shadow-2xl border-2 flex flex-col items-center gap-6"
        style={{
          background: 'linear-gradient(135deg, #F5F0E8, #ede4d3, #F5F0E8)',
          borderColor: 'var(--color-gold)',
        }}
        initial={{ y: 50, scale: 0.9, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
      >
        {/* Header */}
        <motion.h1
          className="text-4xl font-bold"
          style={{
            color: 'var(--color-gold)',
            fontFamily: 'serif',
            textShadow: '0 2px 4px rgba(0,0,0,0.15)',
          }}
          initial={{ scale: 0 }}
          animate={{ scale: [0, 1.2, 1] }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          大获全胜！
        </motion.h1>

        {/* Stars */}
        <div className="flex gap-4">
          {[1, 2, 3].map((n) => (
            <StarIcon key={n} filled={n <= clampedStars} delay={0.5 + n * 0.2} />
          ))}
        </div>

        {/* XP reward */}
        <motion.div
          className="flex items-center gap-2 text-2xl font-bold"
          style={{ color: 'var(--color-ink)', fontFamily: 'serif' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span>经验值 +</span>
          <span style={{ color: 'var(--color-gold)' }}>
            <CountUpNumber target={rewards.xp} />
          </span>
        </motion.div>

        {/* Unlocked generals */}
        {rewards.unlockGenerals && rewards.unlockGenerals.length > 0 && (
          <motion.div
            className="w-full"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5 }}
          >
            <p
              className="text-sm font-bold text-center mb-2"
              style={{ color: 'var(--color-bamboo)', fontFamily: 'serif' }}
            >
              解锁武将
            </p>
            <div className="flex justify-center gap-3">
              {rewards.unlockGenerals.map((generalId, i) => (
                <motion.div
                  key={generalId}
                  className="flex items-center justify-center rounded-full border-2 shadow-md"
                  style={{
                    width: 56,
                    height: 56,
                    backgroundColor: 'var(--color-shu-red)',
                    borderColor: 'var(--color-gold)',
                  }}
                  initial={{ rotateY: 180, opacity: 0 }}
                  animate={{ rotateY: 0, opacity: 1 }}
                  transition={{ delay: 1.7 + i * 0.2, duration: 0.5 }}
                >
                  <span className="text-white font-bold text-lg" style={{ fontFamily: 'serif' }}>
                    {generalId.charAt(0).toUpperCase()}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Quote */}
        {rewards.quote && (
          <motion.div
            className="w-full rounded-lg p-4 border"
            style={{
              backgroundColor: 'rgba(139,115,85,0.08)',
              borderColor: 'var(--color-bamboo)',
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
          >
            <p
              className="text-sm text-center italic leading-relaxed"
              style={{
                color: 'var(--color-bamboo)',
                fontFamily: 'serif',
              }}
            >
              &ldquo;{rewards.quote}&rdquo;
            </p>
          </motion.div>
        )}

        {/* Continue button */}
        <motion.button
          onClick={onContinue}
          className="mt-2 px-10 py-3 rounded-lg text-white font-bold text-lg transition-transform active:scale-95 cursor-pointer"
          style={{
            backgroundColor: 'var(--color-shu-red)',
            fontFamily: 'serif',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.2 }}
        >
          继续
        </motion.button>
      </motion.div>
    </motion.div>
  );
}
