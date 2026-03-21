'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PythonConcept } from '@/lib/levels/concepts';

interface ConceptCardProps {
  concept: PythonConcept;
  isUnlocked: boolean;
}

export function ConceptCard({ concept, isUnlocked }: ConceptCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(concept.example);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
    }
  };

  /* ---- Locked state ---- */
  if (!isUnlocked) {
    return (
      <div className="flex items-center gap-4 rounded-lg border-2 border-bamboo/15 bg-bamboo/5 px-4 py-3 opacity-50 select-none sm:px-6 sm:py-4">
        {/* Lock icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-bamboo/10 sm:h-14 sm:w-14">
          <LockIcon className="h-6 w-6 text-bamboo/40" />
        </div>

        {/* Name placeholder */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-bamboo/40 sm:text-base">???</p>
          <p className="text-xs text-bamboo/30">尚未习得</p>
        </div>

        {/* Greyed alias */}
        <span className="hidden text-lg font-bold text-bamboo/20 sm:block">
          未解锁
        </span>
      </div>
    );
  }

  /* ---- Unlocked state ---- */
  return (
    <motion.div
      layout
      className="overflow-hidden rounded-lg border-2 border-amber-700/25 bg-gradient-to-r from-amber-50 via-orange-50/60 to-amber-50 shadow-sm"
    >
      {/* Main row — styled like a bamboo slip */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-amber-100/40 sm:gap-5 sm:px-6 sm:py-4"
      >
        {/* Left: Three Kingdoms alias in calligraphy style */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-amber-700/20 bg-amber-100/80 sm:h-14 sm:w-14">
          <span className="text-lg font-black text-amber-900 sm:text-xl">
            {concept.threeKingdomsName.slice(0, 2)}
          </span>
        </div>

        {/* Center: Python concept name + description */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-ink sm:text-base">
              {concept.name}
            </h3>
            <span className="rounded-full bg-amber-700/10 px-2 py-0.5 text-[10px] font-semibold text-amber-800 sm:text-xs">
              {concept.threeKingdomsName}
            </span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-xs text-bamboo sm:text-sm">
            {concept.description}
          </p>
        </div>

        {/* Right: expand/collapse chevron */}
        <div className="flex shrink-0 flex-col items-center gap-1">
          <span className="text-[10px] font-medium text-amber-800 sm:text-xs">
            试一试
          </span>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="h-4 w-4 text-bamboo" />
          </motion.div>
        </div>
      </button>

      {/* Expandable code example */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="code-panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-amber-700/15 bg-white/70 px-4 pb-4 pt-3 sm:px-6">
              {/* Code block */}
              <div className="relative rounded-md border border-bamboo/20 bg-stone-50">
                <div className="flex items-center justify-between border-b border-bamboo/10 px-3 py-1.5">
                  <span className="text-[10px] font-medium text-bamboo/60 sm:text-xs">
                    Python 示例
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy();
                    }}
                    className="rounded px-2 py-0.5 text-[10px] font-medium text-bamboo transition-colors hover:bg-bamboo/10 hover:text-ink sm:text-xs"
                  >
                    {copied ? '已复制 ✓' : '复制代码'}
                  </button>
                </div>
                <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-ink sm:text-sm">
                  <code>{concept.example}</code>
                </pre>
              </div>

              {/* Expected output */}
              <div className="mt-2 rounded-md border border-wu-green/20 bg-wu-green/5 px-3 py-2">
                <span className="text-[10px] font-semibold text-wu-green sm:text-xs">
                  输出结果：
                </span>
                <pre className="mt-1 text-xs text-wu-green/80 sm:text-sm">
                  {concept.expectedOutput}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ---- Inline SVG icons ---- */

function LockIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  );
}
