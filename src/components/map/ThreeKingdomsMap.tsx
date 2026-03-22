'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Chapter } from '@/lib/levels';
import { getProgress, isChapterUnlocked, type LocalProgress } from '@/lib/progress';
import { MapNavBar } from './MapNavBar';
import { CityNode, type CityStatus } from './CityNode';
import { MapPath, type PathStatus } from './MapPath';

/* ---------- Act metadata ---------- */

const ACT_LABELS: Record<number, string> = {
  1: '第一幕：群雄并起',
  2: '第二幕：卧龙出山',
  3: '第三幕：三分天下',
  4: '第四幕：北伐中原',
};

/* ---------- Layout ---------- */

/**
 * Generate a winding path of (x, y) positions for each chapter.
 *
 * The chapters snake across the map:
 *   Act I  — left-to-right across the top
 *   Act II — right-to-left through the middle
 *   Act III — left-to-right lower
 *   Act IV — right-to-left at bottom, ending with a larger finale node
 *
 * All coordinates are in SVG viewport units (0-1000 x, 0-800 y).
 */
function computeNodePositions(chapters: Chapter[]): { x: number; y: number }[] {
  const positions: { x: number; y: number }[] = [];

  // Group by act
  const acts: Record<number, Chapter[]> = {};
  for (const ch of chapters) {
    if (!acts[ch.act]) acts[ch.act] = [];
    acts[ch.act].push(ch);
  }

  // Y bands for each act row
  const actBaseY: Record<number, number> = { 1: 140, 2: 310, 3: 480, 4: 650 };

  for (const ch of chapters) {
    const actChapters = acts[ch.act];
    const indexInAct = actChapters.indexOf(ch);
    const count = actChapters.length;

    const baseY = actBaseY[ch.act] ?? 400;

    // Horizontal spacing: distribute across 120..880
    const margin = 120;
    const usable = 1000 - 2 * margin;
    const spacing = count > 1 ? usable / (count - 1) : 0;

    // Odd acts go left-to-right, even acts right-to-left
    const leftToRight = ch.act % 2 === 1;
    const xPos = count === 1
      ? 500
      : leftToRight
        ? margin + indexInAct * spacing
        : (1000 - margin) - indexInAct * spacing;

    // Add slight vertical wave for visual interest
    const wave = Math.sin((indexInAct / Math.max(count - 1, 1)) * Math.PI) * 30;

    positions.push({ x: xPos, y: baseY + wave });
  }

  return positions;
}

/**
 * Compute the Y position for each act label.
 */
function computeActLabelPositions(chapters: Chapter[]): { act: number; y: number }[] {
  const seen = new Set<number>();
  const results: { act: number; y: number }[] = [];
  const actBaseY: Record<number, number> = { 1: 140, 2: 310, 3: 480, 4: 650 };

  for (const ch of chapters) {
    if (!seen.has(ch.act)) {
      seen.add(ch.act);
      results.push({ act: ch.act, y: (actBaseY[ch.act] ?? 400) - 60 });
    }
  }
  return results;
}

/* ---------- Component ---------- */

interface ThreeKingdomsMapProps {
  chapters: Chapter[];
}

export function ThreeKingdomsMap({ chapters }: ThreeKingdomsMapProps) {
  const [progress, setProgress] = useState<LocalProgress | null>(null);

  useEffect(() => {
    setProgress(getProgress());
  }, []);

  // While loading from localStorage, show a brief skeleton
  if (!progress) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-parchment">
        <p className="text-bamboo">加载中...</p>
      </div>
    );
  }

  const sortedIds = chapters.map((c) => c.id);
  const positions = computeNodePositions(chapters);
  const actLabels = computeActLabelPositions(chapters);

  // Determine status for each chapter
  const statuses: CityStatus[] = chapters.map((ch) => {
    if (ch.id in progress.completedChapters) return 'completed';
    if (isChapterUnlocked(ch.id, sortedIds, progress.completedChapters)) return 'current';
    return 'locked';
  });

  // Path statuses: between consecutive chapters
  const pathStatuses: PathStatus[] = [];
  for (let i = 0; i < chapters.length - 1; i++) {
    if (statuses[i] === 'completed' && statuses[i + 1] === 'completed') {
      pathStatuses.push('completed');
    } else if (
      statuses[i] === 'completed' &&
      (statuses[i + 1] === 'current')
    ) {
      pathStatuses.push('current');
    } else {
      pathStatuses.push('locked');
    }
  }

  // Compute SVG height based on actual node positions
  const maxY = Math.max(...positions.map((p) => p.y));
  const svgHeight = maxY + 120; // leave room below the lowest node for labels

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      <MapNavBar progress={progress} onUserSwitch={() => setProgress(getProgress())} />

      <main className="relative flex-1 overflow-auto">
        {/* Parchment texture overlay */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'url("data:image/svg+xml,%3Csvg width=\'6\' height=\'6\' viewBox=\'0 0 6 6\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%232C1810\' fill-opacity=\'1\'%3E%3Cpath d=\'M5 0h1L0 5V4zM6 5v1H5z\'/%3E%3C/g%3E%3C/svg%3E")',
          }}
        />

        <motion.div
          className="mx-auto w-full max-w-4xl px-4 py-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Page title */}
          <h1 className="mb-2 text-center text-2xl font-bold text-ink sm:text-3xl">
            征途地图
          </h1>
          <p className="mb-6 text-center text-sm text-bamboo">
            完成关卡，一统三国！
          </p>

          {/* SVG Map */}
          <svg
            viewBox={`0 0 1000 ${svgHeight}`}
            className="w-full"
            preserveAspectRatio="xMidYMid meet"
            role="img"
            aria-label="三国征途地图"
          >
            {/* Decorative background elements */}
            <defs>
              <radialGradient id="map-vignette" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="transparent" />
                <stop offset="100%" stopColor="rgba(44, 24, 16, 0.06)" />
              </radialGradient>
            </defs>
            <rect width="1000" height={svgHeight} fill="url(#map-vignette)" />

            {/* Act section labels */}
            {actLabels.map(({ act, y }) => (
              <g key={`act-${act}`}>
                {/* Horizontal divider line */}
                <line
                  x1={60}
                  y1={y + 12}
                  x2={940}
                  y2={y + 12}
                  stroke="var(--color-bamboo)"
                  strokeWidth={0.5}
                  opacity={0.3}
                />
                {/* Act label background */}
                <rect
                  x={340}
                  y={y - 8}
                  width={320}
                  height={36}
                  rx={18}
                  fill="var(--color-parchment)"
                  stroke="var(--color-bamboo)"
                  strokeWidth={1}
                  opacity={0.8}
                />
                <text
                  x={500}
                  y={y + 16}
                  textAnchor="middle"
                  fontSize="16"
                  fontWeight="700"
                  fill="var(--color-bamboo)"
                  letterSpacing="2"
                >
                  {ACT_LABELS[act] ?? `第${act}幕`}
                </text>
              </g>
            ))}

            {/* Paths between cities */}
            {pathStatuses.map((pStatus, i) => (
              <MapPath
                key={`path-${i}`}
                x1={positions[i].x}
                y1={positions[i].y}
                x2={positions[i + 1].x}
                y2={positions[i + 1].y}
                status={pStatus}
              />
            ))}

            {/* City nodes */}
            {chapters.map((ch, i) => (
              <CityNode
                key={ch.id}
                chapter={ch}
                status={statuses[i]}
                stars={progress.completedChapters[ch.id]?.stars}
                x={positions[i].x}
                y={positions[i].y}
              />
            ))}
          </svg>
        </motion.div>
      </main>
    </div>
  );
}
