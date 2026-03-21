'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface StoryIntroProps {
  title: string;
  story: string;
  onContinue: () => void;
}

export function StoryIntro({ title, story, onContinue }: StoryIntroProps) {
  const [displayedLength, setDisplayedLength] = useState(0);
  const isComplete = displayedLength >= story.length;

  useEffect(() => {
    if (displayedLength >= story.length) return;

    const timer = setTimeout(() => {
      setDisplayedLength((prev) => prev + 1);
    }, 50);

    return () => clearTimeout(timer);
  }, [displayedLength, story.length]);

  const handleSkipOrContinue = useCallback(() => {
    if (!isComplete) {
      // Skip to end of text
      setDisplayedLength(story.length);
    } else {
      onContinue();
    }
  }, [isComplete, story.length, onContinue]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at center, rgba(245,240,232,0.97), rgba(212,168,67,0.15)),
            linear-gradient(180deg, #F5F0E8 0%, #e8dcc8 100%)
          `,
        }}
      />

      {/* Parchment card */}
      <motion.div
        className="relative z-10 w-full max-w-lg mx-6 rounded-xl p-8 shadow-2xl border-2"
        style={{
          background: `
            linear-gradient(135deg, #F5F0E8 0%, #ede4d3 50%, #F5F0E8 100%)
          `,
          borderColor: 'var(--color-bamboo)',
        }}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        {/* Decorative top border */}
        <div
          className="absolute top-0 left-6 right-6 h-1 rounded-full"
          style={{ backgroundColor: 'var(--color-gold)' }}
        />

        {/* Title */}
        <h1
          className="text-3xl font-bold text-center mb-6"
          style={{
            color: 'var(--color-ink)',
            fontFamily: 'serif',
          }}
        >
          {title}
        </h1>

        {/* Story text with typewriter effect */}
        <div
          className="min-h-[120px] text-lg leading-relaxed"
          style={{
            color: 'var(--color-ink)',
            fontFamily: 'serif',
          }}
        >
          {story.slice(0, displayedLength)}
          {!isComplete && (
            <motion.span
              className="inline-block w-0.5 h-5 ml-0.5 align-text-bottom"
              style={{ backgroundColor: 'var(--color-ink)' }}
              animate={{ opacity: [1, 0] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
          )}
        </div>

        {/* Continue button */}
        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: isComplete ? 1 : 0.4 }}
          transition={{ duration: 0.3 }}
        >
          <button
            onClick={handleSkipOrContinue}
            className="px-8 py-3 rounded-lg text-white font-bold text-lg transition-transform active:scale-95 cursor-pointer"
            style={{
              backgroundColor: 'var(--color-shu-red)',
              fontFamily: 'serif',
            }}
          >
            {isComplete ? '继续' : '跳过'}
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
