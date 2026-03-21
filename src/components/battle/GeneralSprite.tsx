'use client';

import { motion } from 'framer-motion';

type BattlePhase =
  | 'story_intro'
  | 'challenge'
  | 'validating'
  | 'qi_charging'
  | 'error_feedback'
  | 'skill_ready'
  | 'skill_animation'
  | 'victory'
  | 'rewards';

interface GeneralSpriteProps {
  generalId: string;
  side: 'left' | 'right';
  phase: BattlePhase;
}

/**
 * Map a general ID to its display character (first character of the name).
 * For now, uses a hardcoded lookup; real data will come from a generals registry.
 */
const GENERAL_NAME_MAP: Record<string, string> = {
  guan_yu: '关',
  zhang_fei: '张',
  liu_bei: '刘',
  zhao_yun: '赵',
  zhuge_liang: '诸',
  cao_cao: '曹',
  xiahou_dun: '夏',
  lu_bu: '吕',
  sun_ce: '孙',
  zhou_yu: '周',
  huang_zhong: '黄',
  ma_chao: '马',
};

function getDisplayChar(generalId: string): string {
  return GENERAL_NAME_MAP[generalId] || generalId.charAt(0).toUpperCase();
}

function getPhaseAnimation(phase: BattlePhase, side: 'left' | 'right') {
  const direction = side === 'left' ? 1 : -1;

  switch (phase) {
    case 'qi_charging':
      return {
        animate: {
          y: [-2, 2, -2],
          rotate: [0, direction * 5, 0],
        },
        transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const },
      };
    case 'skill_ready':
      return {
        animate: {
          y: [-3, 3, -3],
          scale: [1, 1.05, 1],
        },
        transition: { duration: 0.8, repeat: Infinity, ease: 'easeInOut' as const },
      };
    case 'skill_animation':
      return {
        animate: {
          x: [0, direction * 40, 0],
          scale: [1, 1.3, 1],
        },
        transition: { duration: 0.6, ease: 'easeOut' as const },
      };
    case 'victory':
      return {
        animate: {
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        },
        transition: { duration: 0.6, repeat: Infinity, repeatDelay: 0.3, ease: 'easeOut' as const },
      };
    default:
      // Idle float
      return {
        animate: { y: [-3, 3, -3] },
        transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' as const },
      };
  }
}

export function GeneralSprite({ generalId, side, phase }: GeneralSpriteProps) {
  const displayChar = getDisplayChar(generalId);
  const isPlayer = side === 'left';
  const anim = getPhaseAnimation(phase, side);

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      {...anim}
    >
      {/* Character circle */}
      <div
        className="relative flex items-center justify-center rounded-full border-3 shadow-lg select-none"
        style={{
          width: 80,
          height: 80,
          backgroundColor: isPlayer ? 'var(--color-shu-red)' : '#4a4a4a',
          borderColor: isPlayer ? 'var(--color-gold)' : '#777',
          transform: side === 'right' ? 'scaleX(-1)' : undefined,
        }}
      >
        <span
          className="text-3xl font-bold text-white"
          style={{
            fontFamily: 'serif',
            transform: side === 'right' ? 'scaleX(-1)' : undefined,
          }}
        >
          {displayChar}
        </span>

        {/* Glow for skill_ready */}
        {phase === 'skill_ready' && (
          <motion.div
            className="absolute inset-0 rounded-full"
            style={{
              boxShadow: `0 0 20px var(--color-gold), 0 0 40px var(--color-gold)`,
            }}
            animate={{ opacity: [0.4, 0.9, 0.4] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
      </div>

      {/* Name label */}
      <span
        className="text-xs font-bold px-2 py-0.5 rounded-full text-white shadow-sm"
        style={{
          backgroundColor: isPlayer ? 'var(--color-shu-red)' : '#555',
          fontFamily: 'serif',
        }}
      >
        {generalId.replace(/_/g, '')}
      </span>
    </motion.div>
  );
}
