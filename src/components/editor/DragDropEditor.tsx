'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EditorProps } from './types';
import type { DragOption } from '@/lib/levels/types';

interface SlotState {
  /** The DragOption placed in this slot, or null if empty */
  option: DragOption | null;
  /** Whether this slot was just correctly filled (for animation) */
  correct: boolean;
  /** Whether this slot was just incorrectly attempted (for shake) */
  wrong: boolean;
}

export function DragDropEditor({
  challenge,
  onSubmit,
  onPartialProgress,
  disabled = false,
}: EditorProps) {
  const dragOptions = challenge.dragOptions ?? [];

  // Determine how many slots we need from the drag options
  const slotCount = dragOptions.reduce((max, opt) => {
    if (opt.isCorrect && opt.slot !== undefined) {
      return Math.max(max, opt.slot + 1);
    }
    return max;
  }, 0);

  const [slots, setSlots] = useState<SlotState[]>(() =>
    Array.from({ length: slotCount }, () => ({
      option: null,
      correct: false,
      wrong: false,
    }))
  );

  // Track which option is "selected" via click-to-select flow
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  // Stable ref for onSubmit to avoid useEffect re-triggering on callback identity change
  const onSubmitRef = useRef(onSubmit);
  onSubmitRef.current = onSubmit;

  // Track which option IDs have been placed in correct slots
  const placedOptionIds = new Set(
    slots.filter((s) => s.option !== null).map((s) => s.option!.id)
  );

  // Track drag-over state for visual feedback
  const [dragOverSlot, setDragOverSlot] = useState<number | null>(null);

  // Report partial progress whenever slots change
  useEffect(() => {
    if (!onPartialProgress || slotCount === 0) return;
    const filledCorrectly = slots.filter((s) => s.correct).length;
    onPartialProgress(Math.round((filledCorrectly / slotCount) * 100));
  }, [slots, slotCount, onPartialProgress]);

  // Check if all slots are correctly filled and auto-submit
  useEffect(() => {
    if (slotCount === 0) return;
    const allCorrect = slots.every((s) => s.correct);
    if (allCorrect) {
      // Assemble code from slots in order
      const assembledCode = slots.map((s) => s.option!.code).join('\n');
      // Small delay so the user sees the final animation
      const timer = setTimeout(() => onSubmitRef.current(assembledCode), 600);
      return () => clearTimeout(timer);
    }
  }, [slots, slotCount]);

  const attemptPlace = useCallback(
    (optionId: string, slotIndex: number) => {
      if (disabled) return;

      const option = dragOptions.find((o) => o.id === optionId);
      if (!option) return;

      // Check if this option belongs in this slot
      const isCorrectPlacement = option.isCorrect && option.slot === slotIndex;

      if (isCorrectPlacement) {
        setSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = { option, correct: true, wrong: false };
          return next;
        });
        setSelectedOptionId(null);
      } else {
        // Wrong placement: trigger shake animation, then clear
        setSlots((prev) => {
          const next = [...prev];
          next[slotIndex] = { ...next[slotIndex], wrong: true };
          return next;
        });
        setTimeout(() => {
          setSlots((prev) => {
            const next = [...prev];
            next[slotIndex] = { ...next[slotIndex], wrong: false };
            return next;
          });
        }, 500);
        setSelectedOptionId(null);
      }
    },
    [dragOptions, disabled]
  );

  // --- Drag handlers ---
  const handleDragStart = (e: React.DragEvent, optionId: string) => {
    if (disabled) return;
    e.dataTransfer.setData('text/plain', optionId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSlot(slotIndex);
  };

  const handleDragLeave = () => {
    setDragOverSlot(null);
  };

  const handleDrop = (e: React.DragEvent, slotIndex: number) => {
    e.preventDefault();
    setDragOverSlot(null);
    const optionId = e.dataTransfer.getData('text/plain');
    if (optionId) {
      attemptPlace(optionId, slotIndex);
    }
  };

  // --- Click-to-select handlers ---
  const handleOptionClick = (optionId: string) => {
    if (disabled) return;
    if (selectedOptionId === optionId) {
      setSelectedOptionId(null); // deselect
    } else {
      setSelectedOptionId(optionId);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (disabled || !selectedOptionId) return;
    if (slots[slotIndex].correct) return; // already filled
    attemptPlace(selectedOptionId, slotIndex);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Challenge prompt - speech bubble style */}
      <div className="relative bg-white rounded-2xl border-2 border-[var(--color-bamboo)] p-5 shadow-md">
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-b-2 border-r-2 border-[var(--color-bamboo)] rotate-45 transform" />
        <p className="text-lg font-medium text-[var(--color-ink)] leading-relaxed">
          {challenge.prompt}
        </p>
      </div>

      {/* Drop zones */}
      <div className="flex flex-col gap-3" role="list" aria-label="代码放置区">
        {slots.map((slot, index) => (
          <motion.div
            key={index}
            role="listitem"
            data-testid={`drop-zone-${index}`}
            className={`
              min-h-[56px] rounded-xl border-2 border-dashed px-4 py-3
              flex items-center justify-center cursor-pointer
              transition-colors duration-200 font-mono text-base
              ${
                slot.correct
                  ? 'border-solid border-green-500 bg-green-50 shadow-[0_0_8px_rgba(34,197,94,0.3)]'
                  : slot.wrong
                    ? 'border-red-400 bg-red-50'
                    : dragOverSlot === index
                      ? 'border-blue-400 bg-blue-50'
                      : selectedOptionId
                        ? 'border-[var(--color-gold)] bg-[var(--color-parchment)] hover:border-blue-400 hover:bg-blue-50'
                        : 'border-[var(--color-bamboo)] bg-[var(--color-parchment)]'
              }
            `}
            animate={
              slot.wrong
                ? { x: [0, -8, 8, -8, 8, 0] }
                : slot.correct
                  ? { scale: 1.03 }
                  : { scale: 1 }
            }
            transition={
              slot.wrong
                ? { duration: 0.4 }
                : { type: 'spring', stiffness: 300, damping: 15 }
            }
            onDragOver={(e) => handleDragOver(e, index)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, index)}
            onClick={() => handleSlotClick(index)}
          >
            <span className="text-sm text-[var(--color-bamboo)] mr-3 font-sans font-bold select-none">
              {index + 1}.
            </span>
            {slot.option ? (
              <span className="flex items-center gap-2 text-[var(--color-ink)] font-mono">
                {slot.option.code}
                {slot.correct && (
                  <motion.span
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-green-500 text-xl"
                  >
                    &#10003;
                  </motion.span>
                )}
              </span>
            ) : (
              <span className="text-[var(--color-bamboo)] text-sm opacity-60 select-none">
                将代码拖到这里
              </span>
            )}
          </motion.div>
        ))}
      </div>

      {/* Draggable code blocks */}
      <div
        className="flex flex-wrap gap-3 justify-center pt-2"
        role="list"
        aria-label="可选代码块"
      >
        <AnimatePresence>
          {dragOptions.map((option) => {
            const isPlaced = placedOptionIds.has(option.id);
            const isSelected = selectedOptionId === option.id;

            return (
              <motion.button
                key={option.id}
                role="listitem"
                data-testid={`drag-option-${option.id}`}
                layout
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                draggable={!isPlaced && !disabled}
                onDragStart={(e) =>
                  handleDragStart(
                    e as unknown as React.DragEvent,
                    option.id
                  )
                }
                onClick={() => !isPlaced && handleOptionClick(option.id)}
                className={`
                  px-5 py-3 rounded-full font-mono text-base
                  border-2 select-none
                  transition-all duration-200
                  min-h-[48px]
                  ${
                    isPlaced
                      ? 'opacity-30 cursor-default border-gray-300 bg-gray-100 text-gray-400'
                      : isSelected
                        ? 'border-blue-500 bg-blue-50 text-[var(--color-ink)] shadow-md cursor-pointer ring-2 ring-blue-300'
                        : 'border-[var(--color-gold)] bg-[var(--color-parchment)] text-[var(--color-ink)] cursor-grab hover:shadow-md hover:border-[var(--color-shu-red)] active:cursor-grabbing'
                  }
                `}
                disabled={isPlaced || disabled}
              >
                {option.code}
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
