'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { EditorView, keymap, placeholder as cmPlaceholder, lineNumbers } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';
import { indentWithTab } from '@codemirror/commands';
import type { EditorProps } from './types';

export function FreeCodeEditor({
  challenge,
  onSubmit,
  disabled = false,
}: EditorProps) {
  const [code, setCode] = useState(challenge.codeTemplate ?? '');
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const codeRef = useRef(code);
  codeRef.current = code;
  const readOnlyComp = useRef(new Compartment());

  // Initialize CodeMirror
  useEffect(() => {
    if (!editorRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const newCode = update.state.doc.toString();
        codeRef.current = newCode;
        setCode(newCode);
      }
    });

    const state = EditorState.create({
      doc: challenge.codeTemplate ?? '',
      extensions: [
        lineNumbers(),
        python(),
        oneDark,
        keymap.of([indentWithTab]),
        updateListener,
        cmPlaceholder('在这里编写你的 Python 代码 ...'),
        EditorView.theme({
          '&': {
            fontSize: '15px',
            minHeight: '180px',
            borderRadius: '12px',
            overflow: 'hidden',
          },
          '.cm-content': {
            fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace',
            padding: '12px 0',
            minHeight: '180px',
          },
          '.cm-gutters': {
            borderRight: '1px solid #3e4451',
            minWidth: '36px',
          },
          '.cm-scroller': {
            overflow: 'auto',
          },
          '&.cm-focused': {
            outline: '2px solid var(--color-gold)',
            outlineOffset: '-2px',
          },
        }),
        readOnlyComp.current.of(EditorState.readOnly.of(disabled)),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });
    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  // Only recreate on challenge change, not on every disabled toggle
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [challenge.id]);

  // Update readOnly when disabled changes
  useEffect(() => {
    if (!viewRef.current) return;
    viewRef.current.dispatch({
      effects: readOnlyComp.current.reconfigure(EditorState.readOnly.of(disabled)),
    });
  }, [disabled]);

  const handleSubmit = useCallback(() => {
    if (disabled) return;
    onSubmit(codeRef.current);
  }, [disabled, onSubmit]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      {/* Challenge prompt */}
      <div className="relative bg-white rounded-2xl border-2 border-[var(--color-bamboo)] p-5 shadow-md">
        <div className="absolute -bottom-3 left-8 w-6 h-6 bg-white border-b-2 border-r-2 border-[var(--color-bamboo)] rotate-45 transform" />
        <p className="text-lg font-medium text-[var(--color-ink)] leading-relaxed">
          {challenge.prompt}
        </p>
      </div>

      {/* CodeMirror editor */}
      <div
        ref={editorRef}
        data-testid="code-editor"
        className="rounded-xl overflow-hidden shadow-md"
      />

      {/* Submit button */}
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
