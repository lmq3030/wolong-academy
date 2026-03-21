'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { EditorProps } from './types';

export function FreeCodeEditor({
  challenge,
  onSubmit,
  disabled = false,
}: EditorProps) {
  const [code, setCode] = useState(challenge.codeTemplate ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.max(el.scrollHeight, 200)}px`;
  }, [code]);

  const lineCount = code.split('\n').length;

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (disabled) return;

      const el = e.currentTarget;

      // Tab inserts 4 spaces
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = el.selectionStart;
        const end = el.selectionEnd;
        const before = code.slice(0, start);
        const after = code.slice(end);
        const newCode = before + '    ' + after;
        setCode(newCode);
        // Restore cursor position after state update
        requestAnimationFrame(() => {
          el.selectionStart = start + 4;
          el.selectionEnd = start + 4;
        });
      }

      // Enter preserves indentation
      if (e.key === 'Enter') {
        e.preventDefault();
        const start = el.selectionStart;
        const before = code.slice(0, start);
        const after = code.slice(el.selectionEnd);

        // Find the current line's leading whitespace
        const currentLine = before.split('\n').pop() ?? '';
        const indent = currentLine.match(/^(\s*)/)?.[1] ?? '';

        // If the line ends with ':', add extra indent
        const trimmedLine = currentLine.trimEnd();
        const extraIndent = trimmedLine.endsWith(':') ? '    ' : '';

        const newCode = before + '\n' + indent + extraIndent + after;
        const cursorPos = start + 1 + indent.length + extraIndent.length;
        setCode(newCode);
        requestAnimationFrame(() => {
          el.selectionStart = cursorPos;
          el.selectionEnd = cursorPos;
        });
      }
    },
    [code, disabled]
  );

  const handleSubmit = () => {
    if (disabled) return;
    onSubmit(code);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Challenge prompt */}
      <div className="relative bg-white rounded-2xl border-2 border-[var(--color-bamboo)] p-5 shadow-md">
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-b-2 border-r-2 border-[var(--color-bamboo)] rotate-45 transform" />
        <p className="text-lg font-medium text-[var(--color-ink)] leading-relaxed">
          {challenge.prompt}
        </p>
      </div>

      {/* Code editor area */}
      <div
        className="relative bg-[var(--color-parchment)] rounded-xl border-2 border-[var(--color-bamboo)] overflow-hidden"
        data-testid="code-editor"
      >
        <div className="flex">
          {/* Line numbers */}
          <div
            className="
              flex flex-col items-end px-3 py-4
              bg-[var(--color-bamboo)] bg-opacity-10
              text-[var(--color-bamboo)] text-sm font-mono
              select-none min-w-[40px] border-r border-[var(--color-bamboo)] border-opacity-30
            "
            aria-hidden="true"
          >
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i} className="leading-[1.6rem]">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            data-testid="code-textarea"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            spellCheck={false}
            className="
              flex-1 p-4 font-mono text-lg leading-[1.6rem]
              bg-transparent text-[var(--color-ink)]
              resize-none outline-none
              min-h-[200px]
              disabled:opacity-50
              placeholder:text-[var(--color-bamboo)] placeholder:opacity-50
            "
            placeholder="在这里编写你的 Python 代码..."
          />
        </div>
      </div>

      {/* Submit button - battle horn style */}
      <div className="flex justify-center">
        <motion.button
          whileHover={!disabled ? { scale: 1.05 } : {}}
          whileTap={!disabled ? { scale: 0.95 } : {}}
          onClick={handleSubmit}
          disabled={disabled}
          className={`
            min-w-[200px] min-h-[48px] px-8 py-3
            rounded-xl text-xl font-bold
            flex items-center justify-center gap-2
            transition-all duration-200
            ${
              disabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-[var(--color-shu-red)] text-[var(--color-gold)] shadow-lg hover:shadow-xl cursor-pointer'
            }
          `}
        >
          <span aria-hidden="true" className="text-2xl">&#128226;</span>
          运行代码
        </motion.button>
      </div>
    </div>
  );
}
