'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import type { Chapter } from '@/lib/levels';

export type CityStatus = 'completed' | 'current' | 'locked';

interface CityNodeProps {
  chapter: Chapter;
  status: CityStatus;
  stars?: number;
  /** Absolute position within the SVG coordinate space */
  x: number;
  y: number;
}

export function CityNode({ chapter, status, stars = 0, x, y }: CityNodeProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isDebug = searchParams.get('debug') === '1';

  const size = status === 'current' ? 40 : 30;

  function handleClick() {
    if (status === 'locked') return;
    router.push(`/battle/${chapter.id}${isDebug ? '?debug=1' : ''}`);
  }

  const fillColor =
    status === 'completed'
      ? 'var(--color-shu-red)'
      : status === 'current'
        ? 'var(--color-shu-red)'
        : '#9CA3AF';

  const strokeColor =
    status === 'completed'
      ? 'var(--color-gold)'
      : status === 'current'
        ? 'var(--color-gold)'
        : '#D1D5DB';

  return (
    <g
      onClick={handleClick}
      className={status === 'locked' ? 'cursor-not-allowed' : 'cursor-pointer'}
      role="button"
      tabIndex={status === 'locked' ? -1 : 0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') handleClick();
      }}
      aria-label={`${chapter.title} - ${status === 'locked' ? '未解锁' : status === 'completed' ? '已完成' : '当前关卡'}`}
    >
      {/* Pulsing glow for current node */}
      {status === 'current' && (
        <motion.circle
          cx={x}
          cy={y}
          r={size + 8}
          fill="none"
          stroke="var(--color-gold)"
          strokeWidth={2}
          initial={{ opacity: 0.3 }}
          animate={{ opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}

      {/* Main circle */}
      <circle
        cx={x}
        cy={y}
        r={size}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={status === 'current' ? 4 : 3}
        opacity={status === 'locked' ? 0.4 : 1}
      />

      {/* Inner icon */}
      {status === 'completed' && (
        /* Checkmark */
        <path
          d={`M ${x - 10} ${y} L ${x - 3} ${y + 8} L ${x + 12} ${y - 8}`}
          fill="none"
          stroke="white"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {status === 'current' && (
        /* Simple flag icon for current battle */
        <g transform={`translate(${x - 10}, ${y - 12})`}>
          <line x1={2} y1={0} x2={2} y2={24} stroke="white" strokeWidth={2.5} strokeLinecap="round" />
          <path d="M 4 1 L 18 6 L 4 12 Z" fill="white" />
        </g>
      )}
      {status === 'locked' && (
        /* Lock icon */
        <g transform={`translate(${x}, ${y})`}>
          <rect x={-7} y={-2} width={14} height={11} rx={2} fill="white" opacity={0.7} />
          <path
            d="M -5 -2 V -7 A 5 5 0 0 1 5 -7 V -2"
            fill="none"
            stroke="white"
            strokeWidth={2}
            opacity={0.7}
          />
        </g>
      )}

      {/* Stars for completed chapters */}
      {status === 'completed' && stars > 0 && (
        <g>
          {Array.from({ length: 3 }).map((_, i) => (
            <text
              key={i}
              x={x + (i - 1) * 16}
              y={y - size - 8}
              textAnchor="middle"
              fontSize="14"
              fill={i < stars ? 'var(--color-gold)' : '#D1D5DB'}
            >
              &#9733;
            </text>
          ))}
        </g>
      )}

      {/* Chapter title */}
      <text
        x={x}
        y={y + size + 18}
        textAnchor="middle"
        fontSize="13"
        fontWeight="600"
        fill={status === 'locked' ? '#9CA3AF' : 'var(--color-ink)'}
      >
        {chapter.title}
      </text>

      {/* Python concept subtitle */}
      <text
        x={x}
        y={y + size + 34}
        textAnchor="middle"
        fontSize="10"
        fill={status === 'locked' ? '#9CA3AF' : 'var(--color-bamboo)'}
      >
        {chapter.pythonConcept}
      </text>

      {/* "攻城!" label for current */}
      {status === 'current' && (
        <motion.text
          x={x}
          y={y + size + 52}
          textAnchor="middle"
          fontSize="14"
          fontWeight="bold"
          fill="var(--color-shu-red)"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          攻城!
        </motion.text>
      )}

      {/* Tooltip for locked */}
      {status === 'locked' && (
        <title>完成前面的关卡来解锁</title>
      )}
    </g>
  );
}
