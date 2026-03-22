'use client';

import { useState } from 'react';
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

/** Map general IDs to Chinese names for display */
const GENERAL_NAMES: Record<string, string> = {
  'guan-yu': '关羽',
  'zhang-fei': '张飞',
  'liu-bei': '刘备',
  'zhao-yun': '赵云',
  'zhuge-liang': '诸葛亮',
  'cao-cao': '曹操',
  'xiahou-dun': '夏侯惇',
  'lu-bu': '吕布',
  'sun-ce': '孙策',
  'zhou-yu': '周瑜',
  'huang-zhong': '黄忠',
  'ma-chao': '马超',
  'diao-chan': '貂蝉',
  'sun-quan': '孙权',
  'lu-su': '鲁肃',
  'huang-gai': '黄盖',
  'sima-yi': '司马懿',
  'jiang-wei': '姜维',
  'meng-huo': '孟获',
  'hua-xiong': '华雄',
};

function getDisplayChar(generalId: string): string {
  const normalized = generalId.replace(/_/g, '-');
  const name = GENERAL_NAMES[normalized];
  return name ? name[0] : generalId.charAt(0).toUpperCase();
}

function getDisplayName(generalId: string): string {
  const normalized = generalId.replace(/_/g, '-');
  return GENERAL_NAMES[normalized] || normalized;
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
  const normalizedId = generalId.replace(/_/g, '-');
  const isPlayer = side === 'left';
  const anim = getPhaseAnimation(phase, side);
  const [imgError, setImgError] = useState(false);

  // Try to load portrait from /assets/generals/{id}.png
  const portraitSrc = `/assets/generals/${normalizedId}.png`;

  return (
    <motion.div
      className="flex flex-col items-center gap-1"
      {...anim}
    >
      {/* Character portrait */}
      <div
        className="relative rounded-full border-3 shadow-lg select-none overflow-hidden"
        style={{
          width: 90,
          height: 90,
          borderColor: isPlayer ? 'var(--color-gold)' : '#777',
          backgroundColor: isPlayer ? 'var(--color-shu-red)' : '#4a4a4a',
        }}
      >
        {!imgError ? (
          <img
            src={portraitSrc}
            alt={normalizedId}
            className="w-full h-full object-cover"
            draggable={false}
            onError={() => setImgError(true)}
          />
        ) : (
          /* Fallback: text character */
          <div className="w-full h-full flex items-center justify-center">
            <span
              className="text-3xl font-bold text-white"
              style={{ fontFamily: 'serif' }}
            >
              {displayChar}
            </span>
          </div>
        )}

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
        {getDisplayName(generalId)}
      </span>
    </motion.div>
  );
}
