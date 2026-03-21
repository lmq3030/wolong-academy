'use client';

import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { EditorProps } from './types';

interface BlankSegment {
  type: 'text' | 'blank';
  value: string; // For text segments: the literal text. For blanks: initially empty.
  index: number; // For blanks: the blank index (0-based). For text: -1.
}

function parseTemplate(template: string): { segments: BlankSegment[]; blankCount: number } {
  const parts = template.split('___');
  const segments: BlankSegment[] = [];
  let blankIndex = 0;

  for (let i = 0; i < parts.length; i++) {
    if (parts[i] !== '') {
      segments.push({ type: 'text', value: parts[i], index: -1 });
    }
    if (i < parts.length - 1) {
      segments.push({ type: 'blank', value: '', index: blankIndex });
      blankIndex++;
    }
  }

  return { segments, blankCount: blankIndex };
}

export function FillBlankEditor({
  challenge,
  onSubmit,
  disabled = false,
}: EditorProps) {
  const template = challenge.codeTemplate ?? challenge.correctAnswer;

  const { segments, blankCount } = useMemo(() => parseTemplate(template), [template]);

  const [answers, setAnswers] = useState<string[]>(() =>
    Array.from({ length: blankCount }, () => '')
  );

  const hasChoices = Boolean(challenge.choices && challenge.choices.length > 0);

  const updateAnswer = useCallback((blankIndex: number, value: string) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[blankIndex] = value;
      return next;
    });
  }, []);

  const handleSubmit = () => {
    if (disabled) return;
    // Assemble the code by replacing blanks with answers
    let blankIdx = 0;
    const assembled = template.replace(/___/g, () => {
      const val = answers[blankIdx] ?? '';
      blankIdx++;
      return val;
    });
    onSubmit(assembled);
  };

  const allFilled = answers.every((a) => a.trim() !== '');

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Challenge prompt */}
      <div className="relative bg-white rounded-2xl border-2 border-[var(--color-bamboo)] p-5 shadow-md">
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-b-2 border-r-2 border-[var(--color-bamboo)] rotate-45 transform" />
        <p className="text-lg font-medium text-[var(--color-ink)] leading-relaxed">
          {challenge.prompt}
        </p>
      </div>

      {/* Code with blanks */}
      <div
        className="bg-[var(--color-parchment)] rounded-xl border-2 border-[var(--color-bamboo)] p-5 font-mono text-lg leading-loose overflow-x-auto whitespace-pre-wrap"
        data-testid="code-template"
      >
        {segments.map((seg, i) => {
          if (seg.type === 'text') {
            return (
              <span key={i} className="text-[var(--color-ink)]">
                {seg.value}
              </span>
            );
          }

          // Blank segment with choices: render as inline button that shows current selection
          if (hasChoices) {
            const currentValue = answers[seg.index];
            return (
              <span
                key={i}
                data-testid={`blank-select-${seg.index}`}
                className="inline-block mx-1 relative"
              >
                <span
                  className={`
                    inline-block px-4 py-1 text-lg font-mono rounded-lg border-2 cursor-pointer
                    min-w-[120px] text-center transition-all
                    ${currentValue
                      ? 'bg-green-50 border-green-400 text-[var(--color-ink)]'
                      : 'bg-white border-[var(--color-gold)] text-[var(--color-bamboo)]'
                    }
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                >
                  {currentValue || '点击选择'}
                </span>
                {/* Choice buttons below */}
                {!currentValue && !disabled && (
                  <span className="flex gap-2 mt-2 flex-wrap" data-testid={`blank-choices-${seg.index}`}>
                    {challenge.choices!.map((choice, ci) => (
                      <button
                        key={ci}
                        type="button"
                        onClick={() => updateAnswer(seg.index, choice)}
                        className="
                          px-4 py-2 text-base font-mono rounded-lg border-2
                          border-[var(--color-gold)] bg-[var(--color-parchment)]
                          text-[var(--color-ink)] cursor-pointer
                          hover:border-[var(--color-shu-red)] hover:bg-white
                          transition-all active:scale-95
                          min-h-[44px]
                        "
                        data-testid={`choice-${seg.index}-${ci}`}
                      >
                        {choice}
                      </button>
                    ))}
                  </span>
                )}
              </span>
            );
          }

          return (
            <input
              key={i}
              type="text"
              data-testid={`blank-input-${seg.index}`}
              value={answers[seg.index]}
              onChange={(e) => updateAnswer(seg.index, e.target.value)}
              disabled={disabled}
              placeholder="填写代码"
              className="
                inline-block mx-1 px-3 py-1 text-lg font-mono
                bg-white border-b-3 border-[var(--color-gold)]
                rounded-md text-[var(--color-ink)]
                focus:outline-none focus:border-[var(--color-shu-red)]
                min-w-[140px]
                disabled:opacity-50
                placeholder:text-[var(--color-bamboo)] placeholder:opacity-50
              "
            />
          );
        })}
      </div>

      {/* Submit button - styled as military seal (军令状) */}
      <div className="flex justify-center">
        <motion.button
          whileHover={!disabled && allFilled ? { scale: 1.05 } : {}}
          whileTap={!disabled && allFilled ? { scale: 0.95 } : {}}
          onClick={handleSubmit}
          disabled={disabled || !allFilled}
          className={`
            min-w-[200px] min-h-[48px] px-8 py-3
            rounded-xl text-xl font-bold
            transition-all duration-200
            ${
              disabled || !allFilled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[var(--color-shu-red)] text-[var(--color-gold)] shadow-lg hover:shadow-xl cursor-pointer'
            }
          `}
        >
          提交答案
        </motion.button>
      </div>
    </div>
  );
}
