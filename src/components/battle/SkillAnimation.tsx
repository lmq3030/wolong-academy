'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SkillAnimationProps {
  skillName: string;
  onComplete: () => void;
}

type EffectType = 'arrow' | 'fire' | 'slash' | 'golden';

function detectEffect(skillName: string): EffectType {
  if (/[弓箭弩]/.test(skillName)) return 'arrow';
  if (/[火焰龙]/.test(skillName)) return 'fire';
  if (/[剑斩刀]/.test(skillName)) return 'slash';
  return 'golden';
}

function ArrowEffect() {
  const lines = Array.from({ length: 8 });
  return (
    <>
      {lines.map((_, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{
            width: 4,
            height: 60,
            background: 'linear-gradient(to bottom, var(--color-gold), transparent)',
            top: `${10 + i * 8}%`,
            left: '-10%',
            rotate: -30,
          }}
          initial={{ x: 0, opacity: 0 }}
          animate={{ x: '120vw', opacity: [0, 1, 1, 0] }}
          transition={{
            duration: 0.8,
            delay: i * 0.08,
            ease: 'easeIn',
          }}
        />
      ))}
    </>
  );
}

function FireEffect() {
  return (
    <motion.div
      className="absolute inset-0"
      style={{
        background: 'radial-gradient(ellipse at center, rgba(255,100,0,0.8), rgba(196,30,58,0.4), transparent 70%)',
      }}
      initial={{ scale: 0.2, opacity: 0 }}
      animate={{ scale: [0.2, 1.5], opacity: [0, 0.9, 0] }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
    />
  );
}

function SlashEffect() {
  return (
    <>
      <motion.div
        className="absolute"
        style={{
          width: '150%',
          height: 4,
          background: 'linear-gradient(to right, transparent, white, var(--color-gold), transparent)',
          top: '40%',
          left: '-25%',
          rotate: -30,
          transformOrigin: 'center',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      <motion.div
        className="absolute"
        style={{
          width: '150%',
          height: 4,
          background: 'linear-gradient(to right, transparent, white, var(--color-gold), transparent)',
          top: '55%',
          left: '-25%',
          rotate: 30,
          transformOrigin: 'center',
        }}
        initial={{ scaleX: 0, opacity: 0 }}
        animate={{ scaleX: [0, 1], opacity: [0, 1, 0] }}
        transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
      />
    </>
  );
}

function GoldenBurstEffect() {
  const rings = [0, 1, 2];
  return (
    <>
      {rings.map((i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border-4"
          style={{
            borderColor: 'var(--color-gold)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
          initial={{ width: 0, height: 0, opacity: 1 }}
          animate={{
            width: [0, 600],
            height: [0, 600],
            opacity: [1, 0],
          }}
          transition={{
            duration: 1,
            delay: i * 0.2,
            ease: 'easeOut',
          }}
        />
      ))}
    </>
  );
}

function EffectRenderer({ type }: { type: EffectType }) {
  switch (type) {
    case 'arrow':
      return <ArrowEffect />;
    case 'fire':
      return <FireEffect />;
    case 'slash':
      return <SlashEffect />;
    case 'golden':
      return <GoldenBurstEffect />;
  }
}

export function SkillAnimation({ skillName, onComplete }: SkillAnimationProps) {
  const effect = detectEffect(skillName);

  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* White flash */}
        <motion.div
          className="absolute inset-0 bg-white"
          initial={{ opacity: 1 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        />

        {/* Dark backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        />

        {/* Effect animation */}
        <div className="absolute inset-0 pointer-events-none">
          <EffectRenderer type={effect} />
        </div>

        {/* Skill name */}
        <motion.div
          className="relative z-10 text-center"
          initial={{ scale: 3, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <h1
            className="text-6xl font-bold text-gold drop-shadow-lg"
            style={{
              fontFamily: 'serif',
              textShadow: '0 0 20px var(--color-gold), 0 2px 4px rgba(0,0,0,0.5)',
            }}
          >
            {skillName}
          </h1>
        </motion.div>

        {/* Victory text */}
        <motion.div
          className="relative z-10 mt-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p
            className="text-3xl font-bold text-white"
            style={{
              fontFamily: 'serif',
              textShadow: '0 0 12px var(--color-shu-red)',
            }}
          >
            大获全胜！
          </p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
