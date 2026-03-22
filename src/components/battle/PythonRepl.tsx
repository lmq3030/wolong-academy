'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePyodide } from '@/lib/pyodide/usePyodide';

interface PythonReplProps {
  initialCode?: string;
  isOpen: boolean;
  onClose: () => void;
}

interface OutputLine {
  type: 'input' | 'output' | 'error';
  text: string;
}

/**
 * A real Python REPL (Read-Eval-Print Loop) powered by Pyodide.
 * Kids can type and run Python code to experiment and learn.
 */
export function PythonRepl({ initialCode, isOpen, onClose }: PythonReplProps) {
  const { runCode, isReady, isLoading } = usePyodide();
  const [code, setCode] = useState(initialCode || '');
  const [history, setHistory] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const outputRef = useRef<HTMLDivElement>(null);

  const handleRun = useCallback(async () => {
    if (!code.trim() || !isReady) return;

    setIsRunning(true);

    // Add the code as input to history
    setHistory(prev => [...prev, { type: 'input', text: code }]);

    const result = await runCode(code);

    if (result.success) {
      if (result.output) {
        setHistory(prev => [...prev, { type: 'output', text: result.output }]);
      }
    } else {
      setHistory(prev => [...prev, { type: 'error', text: result.error || '运行出错' }]);
    }

    setIsRunning(false);

    // Scroll to bottom
    setTimeout(() => {
      outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);
  }, [code, isReady, runCode]);

  const handleClear = () => {
    setHistory([]);
    setCode('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleRun();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-stretch"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={onClose} />

          {/* REPL Panel - slides from right */}
          <motion.div
            className="absolute right-0 top-0 bottom-0 w-full max-w-lg flex flex-col shadow-2xl border-l-2"
            style={{
              backgroundColor: '#1e1e2e',
              borderColor: 'var(--color-gold)',
            }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div className="flex items-center gap-3">
                <span className="text-green-400 font-mono font-bold text-sm">Python 试验场</span>
                {isLoading && (
                  <span className="text-yellow-400 text-xs flex items-center gap-1">
                    <span className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    加载Python中...
                  </span>
                )}
                {isReady && (
                  <span className="text-green-400 text-xs">就绪</span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleClear}
                  className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer"
                >
                  清空
                </button>
                <button
                  onClick={onClose}
                  className="px-3 py-1 text-xs rounded bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer"
                >
                  关闭
                </button>
              </div>
            </div>

            {/* Output history */}
            <div
              ref={outputRef}
              className="flex-1 overflow-y-auto p-4 font-mono text-sm space-y-2"
            >
              {history.length === 0 && (
                <div className="text-gray-500 text-sm space-y-1">
                  <p>欢迎来到Python试验场！</p>
                  <p>在下方输入代码，按 Ctrl+Enter 运行。</p>
                  <p className="text-green-400/50">试试输入：print(&quot;你好，三国！&quot;)</p>
                </div>
              )}
              {history.map((line, i) => (
                <div key={i}>
                  {line.type === 'input' && (
                    <div>
                      <span className="text-blue-400">{'>>> '}</span>
                      <pre className="inline whitespace-pre-wrap text-gray-200">{line.text}</pre>
                    </div>
                  )}
                  {line.type === 'output' && (
                    <pre className="whitespace-pre-wrap text-green-300">{line.text}</pre>
                  )}
                  {line.type === 'error' && (
                    <pre className="whitespace-pre-wrap text-red-400">{line.text}</pre>
                  )}
                </div>
              ))}
              {isRunning && (
                <div className="text-yellow-400 flex items-center gap-2">
                  <span className="w-3 h-3 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                  运行中...
                </div>
              )}
            </div>

            {/* Code input */}
            <div className="border-t border-gray-700">
              <div className="flex items-center px-4 py-1 bg-gray-800/50">
                <span className="text-blue-400 font-mono text-sm mr-2">{'>>>'}</span>
                <span className="text-gray-500 text-xs ml-auto">Ctrl+Enter 运行</span>
              </div>
              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 bg-transparent text-gray-200 font-mono text-sm resize-none focus:outline-none"
                style={{ minHeight: 80 }}
                placeholder="输入Python代码..."
                spellCheck={false}
              />
              <div className="px-4 py-2 flex justify-end border-t border-gray-700">
                <button
                  onClick={handleRun}
                  disabled={!isReady || isRunning || !code.trim()}
                  className={`px-6 py-2 rounded-lg font-bold text-sm cursor-pointer transition-all active:scale-95 ${
                    isReady && !isRunning && code.trim()
                      ? 'bg-green-600 text-white hover:bg-green-500'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {isRunning ? '运行中...' : '运行代码'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
