'use client';

import { motion } from 'framer-motion';

export type PathStatus = 'completed' | 'current' | 'locked';

interface MapPathProps {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  status: PathStatus;
}

export function MapPath({ x1, y1, x2, y2, status }: MapPathProps) {
  const strokeColor =
    status === 'completed'
      ? 'var(--color-shu-red)'
      : status === 'current'
        ? 'var(--color-gold)'
        : '#9CA3AF'; // gray-400

  const strokeWidth = status === 'current' ? 3 : 2;

  // Compute a slight curve via a control point offset perpendicular to the line
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  const dx = x2 - x1;
  const dy = y2 - y1;
  const len = Math.sqrt(dx * dx + dy * dy);
  // Perpendicular offset (20% of length, alternating direction based on position)
  const offset = len * 0.15;
  const nx = -dy / len;
  const ny = dx / len;
  const cx = mx + nx * offset;
  const cy = my + ny * offset;

  const pathD = `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`;

  if (status === 'current') {
    return (
      <motion.path
        d={pathD}
        fill="none"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeDasharray="8 6"
        initial={{ strokeDashoffset: 0 }}
        animate={{ strokeDashoffset: -28 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    );
  }

  return (
    <path
      d={pathD}
      fill="none"
      stroke={strokeColor}
      strokeWidth={strokeWidth}
      strokeDasharray={status === 'locked' ? '4 4' : undefined}
      opacity={status === 'locked' ? 0.4 : 1}
    />
  );
}
