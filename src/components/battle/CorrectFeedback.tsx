'use client';

import { motion } from 'framer-motion';

interface CorrectFeedbackProps {
  code: string;
  output: string;
}

/**
 * Shows the code and its execution output when the answer is correct.
 * Displayed during the qi_charging phase to give kids feedback on what their code does.
 */
export function CorrectFeedback({ code, output }: CorrectFeedbackProps) {
  return (
    <motion.div
      className="fixed inset-0 z-35 flex items-center justify-center pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="w-full max-w-md mx-4 rounded-xl shadow-2xl overflow-hidden border-2 pointer-events-auto"
        style={{
          backgroundColor: 'var(--color-parchment)',
          borderColor: 'var(--color-wu-green)',
        }}
        initial={{ scale: 0.8, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 20 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Header */}
        <div
          className="px-4 py-2 flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-wu-green)' }}
        >
          <span className="text-white text-lg">&#10003;</span>
          <span className="text-white font-bold" style={{ fontFamily: 'serif' }}>
            代码正确！看看运行结果：
          </span>
        </div>

        {/* Code display */}
        <div className="px-4 pt-3 pb-2">
          <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-bamboo)', fontFamily: 'serif' }}>
            你的代码：
          </p>
          <div
            className="rounded-lg p-3 font-mono text-sm overflow-x-auto"
            style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4' }}
          >
            <pre className="whitespace-pre-wrap">{code}</pre>
          </div>
        </div>

        {/* Output display */}
        {output && (
          <div className="px-4 pb-3">
            <p className="text-xs font-bold mb-1" style={{ color: 'var(--color-bamboo)', fontFamily: 'serif' }}>
              运行输出：
            </p>
            <div
              className="rounded-lg p-3 font-mono text-sm border"
              style={{
                backgroundColor: 'rgba(45, 106, 79, 0.08)',
                color: 'var(--color-wu-green)',
                borderColor: 'rgba(45, 106, 79, 0.2)',
              }}
            >
              {output.split('\n').filter(Boolean).map((line, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.15 }}
                >
                  {line}
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
