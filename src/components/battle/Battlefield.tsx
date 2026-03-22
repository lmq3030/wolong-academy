'use client';

import { motion } from 'framer-motion';
import type { BattleConfig } from '@/lib/levels/types';
import type { BattlePhase } from '@/lib/engine/types';
import { QiGauge } from './QiGauge';
import { GeneralSprite } from './GeneralSprite';
import { SoldierGroup } from './SoldierGroup';

interface BattlefieldProps {
  battle: BattleConfig;
  qiPercent: number;
  phase: BattlePhase;
}

/**
 * Top half of the battle screen. A horizontal 2D battle scene
 * inspired by 三国群英传2: player on the left, enemy on the right,
 * soldiers advancing toward the center as qi builds.
 */
export function Battlefield({ battle, qiPercent, phase }: BattlefieldProps) {
  const isReady = qiPercent >= 100;

  // Calculate remaining enemy soldiers based on qi (start at 30, decrease)
  const enemySoldierCount = Math.max(0, Math.round(30 - (qiPercent / 100) * 15));

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: 350,
        background: `linear-gradient(180deg, #87CEEB 0%, #B0D4E8 30%, #8FBC8F 40%, #6B8E6B 60%, #5A7A5A 100%)`,
      }}
    >
      {/* Background image as <img> for reliable loading */}
      {battle.bgScene && (
        <img
          src={battle.bgScene}
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          draggable={false}
        />
      )}
      {/* Terrain/ground overlay for depth */}
      <div
        className="absolute bottom-0 left-0 right-0"
        style={{
          height: '45%',
          background: 'linear-gradient(180deg, transparent, rgba(90,122,90,0.3))',
        }}
      />

      {/* Qi Gauge on the left edge */}
      <div className="absolute left-2 top-4 bottom-4 z-20">
        <QiGauge percent={qiPercent} isReady={isReady} />
      </div>

      {/* Player side (left 30%) */}
      <motion.div
        className="absolute left-[8%] bottom-[15%] flex items-end gap-4 z-10"
        animate={{
          x: isReady ? 20 : 0,
        }}
        transition={{ duration: 0.3 }}
      >
        <GeneralSprite
          generalId={battle.playerGeneral}
          side="left"
          phase={phase}
        />
        <SoldierGroup
          count={30}
          side="left"
          qiPercent={qiPercent}
        />
      </motion.div>

      {/* Enemy side (right 30%) */}
      {battle.enemyGeneral && (
        <motion.div
          className="absolute right-[8%] bottom-[15%] flex items-end gap-4 z-10"
          animate={{
            x: isReady ? -10 : 0,
          }}
          transition={{ duration: 0.3 }}
        >
          <SoldierGroup
            count={enemySoldierCount}
            side="right"
            qiPercent={qiPercent}
          />
          <GeneralSprite
            generalId={battle.enemyGeneral}
            side="right"
            phase={phase}
          />
        </motion.div>
      )}

      {/* Center battle zone indicator */}
      <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10">
        <span
          className="px-3 py-1 rounded-full text-sm font-bold text-white/90"
          style={{
            backgroundColor: 'rgba(0,0,0,0.35)',
            fontFamily: 'serif',
          }}
        >
          {battle.playerSkill}
        </span>
      </div>

      {/* Screen flash when qi reaches 100% */}
      {isReady && (
        <motion.div
          className="absolute inset-0 z-30 pointer-events-none"
          style={{ backgroundColor: 'var(--color-gold)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0] }}
          transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
        />
      )}
    </div>
  );
}
