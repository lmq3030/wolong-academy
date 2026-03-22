'use client';

import { AnimatePresence, motion } from 'framer-motion';
import type { Chapter, Challenge, ChapterRewards } from '@/lib/levels/types';
import { CodeEditorSwitch } from '@/components/editor/CodeEditorSwitch';
import { Battlefield } from './Battlefield';
import { StoryIntro } from './StoryIntro';
import { ErrorFeedback } from './ErrorFeedback';
import { SkillAnimation } from './SkillAnimation';
import { VictoryScreen } from './VictoryScreen';

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

interface BattleSceneProps {
  chapter: Chapter;
  phase: BattlePhase;
  qiPercent: number;
  currentChallenge: Challenge;
  errorMessage?: string;
  errorLine?: number;
  rewards?: ChapterRewards;
  stars?: number;
  onSubmitCode: (code: string) => void;
  onNextPhase: () => void;
  onUseHint: () => void;
  currentHint?: string;
}

export function BattleScene({
  chapter,
  phase,
  qiPercent,
  currentChallenge,
  errorMessage,
  errorLine,
  rewards,
  stars = 3,
  onSubmitCode,
  onNextPhase,
  onUseHint,
  currentHint,
}: BattleSceneProps) {
  const isEditorDisabled = phase !== 'challenge';

  return (
    <div className="flex flex-col h-dvh w-full overflow-hidden" style={{ backgroundColor: 'var(--color-parchment)' }}>
      {/* Top ~45%: Battlefield */}
      <div className="flex-none" style={{ height: '45%' }}>
        <Battlefield
          battle={chapter.battle}
          qiPercent={qiPercent}
          phase={phase}
        />
      </div>

      {/* Bottom ~55%: Code Editor + controls */}
      <div className="flex-1 flex flex-col min-h-0 relative">
        {/* Hint display bar — always rendered for stable hydration, hidden when empty */}
        <div
          className={`flex-none px-4 py-2 border-b transition-all ${currentHint ? '' : 'hidden'}`}
          style={{
            backgroundColor: 'rgba(245,240,232,0.95)',
            borderColor: 'var(--color-bamboo)',
          }}
        >
          {currentHint && (
            <p
              className="text-sm px-3 py-1.5 rounded-lg border"
              style={{
                color: 'var(--color-wu-green)',
                backgroundColor: 'rgba(45,106,79,0.06)',
                borderColor: 'rgba(45,106,79,0.2)',
                fontFamily: 'serif',
              }}
            >
              锦囊：{currentHint}
            </p>
          )}
        </div>

        {/* Code editor area */}
        <div className="flex-1 min-h-0 overflow-auto">
          <CodeEditorSwitch
            key={currentChallenge.id}
            challenge={currentChallenge}
            onSubmit={onSubmitCode}
            disabled={isEditorDisabled}
          />
        </div>

        {/* Validating indicator */}
        <AnimatePresence>
          {phase === 'validating' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center bg-white/60 z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex items-center gap-3 px-6 py-3 rounded-xl shadow-md" style={{ backgroundColor: 'var(--color-parchment)' }}>
                <motion.div
                  className="w-5 h-5 rounded-full border-2"
                  style={{ borderColor: 'var(--color-gold)', borderTopColor: 'transparent' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
                />
                <span
                  className="text-sm font-bold"
                  style={{ color: 'var(--color-ink)', fontFamily: 'serif' }}
                >
                  验证中...
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint button (锦囊) */}
        <button
          onClick={onUseHint}
          className="absolute bottom-3 right-3 z-20 flex items-center justify-center rounded-full shadow-lg border-2 transition-transform active:scale-90 cursor-pointer"
          style={{
            width: 48,
            height: 48,
            backgroundColor: 'var(--color-gold)',
            borderColor: 'var(--color-bamboo)',
          }}
          title="锦囊妙计"
        >
          <span className="text-white font-bold text-lg" style={{ fontFamily: 'serif' }}>
            锦
          </span>
        </button>
      </div>

      {/* Phase overlays */}
      <AnimatePresence>
        {phase === 'story_intro' && (
          <StoryIntro
            key="story"
            title={chapter.title}
            story={chapter.storyIntro}
            onContinue={onNextPhase}
          />
        )}

        {phase === 'error_feedback' && errorMessage && (
          <ErrorFeedback
            key="error"
            message={errorMessage}
            lineNumber={errorLine}
            onDismiss={onNextPhase}
          />
        )}

        {phase === 'skill_animation' && (
          <SkillAnimation
            key="skill"
            skillName={chapter.battle.playerSkill}
            onComplete={onNextPhase}
          />
        )}

        {(phase === 'victory' || phase === 'rewards') && rewards && (
          <VictoryScreen
            key="victory"
            rewards={rewards}
            stars={stars}
            onContinue={onNextPhase}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
