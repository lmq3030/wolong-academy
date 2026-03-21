'use client';

import { motion } from 'framer-motion';

interface ErrorFeedbackProps {
  message: string;
  lineNumber?: number;
  onDismiss: () => void;
}

export function ErrorFeedback({ message, lineNumber, onDismiss }: ErrorFeedbackProps) {
  return (
    <motion.div
      className="fixed inset-0 z-40 flex items-center justify-end pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Click backdrop to dismiss */}
      <div
        className="absolute inset-0 bg-black/20 pointer-events-auto"
        onClick={onDismiss}
      />

      {/* Speech bubble container */}
      <motion.div
        className="relative mr-4 mb-4 flex items-end gap-3 pointer-events-auto"
        style={{ maxWidth: 480 }}
        initial={{ x: 300, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      >
        {/* Speech bubble */}
        <div
          className="relative rounded-2xl px-5 py-4 shadow-lg border-2"
          style={{
            backgroundColor: 'var(--color-parchment)',
            borderColor: 'var(--color-bamboo)',
          }}
        >
          {/* Advisor line */}
          <p
            className="text-base leading-relaxed"
            style={{
              color: 'var(--color-ink)',
              fontFamily: 'serif',
            }}
          >
            军师摇了摇羽扇：&ldquo;{message}&rdquo;
          </p>

          {/* Line number hint */}
          {lineNumber !== undefined && (
            <p
              className="mt-2 text-sm"
              style={{
                color: 'var(--color-bamboo)',
                fontFamily: 'serif',
              }}
            >
              第{lineNumber}行的阵法还需调整
            </p>
          )}

          {/* Try again button */}
          <button
            onClick={onDismiss}
            className="mt-3 w-full py-2 rounded-lg text-white font-bold text-base transition-colors cursor-pointer"
            style={{
              backgroundColor: 'var(--color-shu-red)',
              fontFamily: 'serif',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
          >
            再试一次
          </button>

          {/* Speech bubble triangle pointing to advisor */}
          <div
            className="absolute -right-3 bottom-6 w-0 h-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderLeft: `12px solid var(--color-parchment)`,
            }}
          />
        </div>

        {/* Advisor portrait */}
        <div
          className="flex-shrink-0 flex items-center justify-center rounded-full border-3 shadow-md"
          style={{
            width: 64,
            height: 64,
            backgroundColor: 'var(--color-wu-green)',
            borderColor: 'var(--color-gold)',
            fontFamily: 'serif',
          }}
        >
          <span className="text-white font-bold text-lg">诸葛</span>
        </div>
      </motion.div>
    </motion.div>
  );
}
