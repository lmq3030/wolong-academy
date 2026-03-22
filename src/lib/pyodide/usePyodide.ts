'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { PyodideResult, PyodideStatus } from './types';

let globalId = 0;

export function usePyodide() {
  const [status, setStatus] = useState<PyodideStatus>('loading');
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, {
    resolve: (result: PyodideResult) => void;
    reject: (error: Error) => void;
  }>>(new Map());

  const initWorker = useCallback(() => {
    // Terminate existing worker if any
    if (workerRef.current) {
      workerRef.current.terminate();
      workerRef.current = null;
    }

    setStatus('loading');

    const worker = new Worker('/pyodide-worker.js');
    workerRef.current = worker;

    worker.onmessage = (event) => {
      const data = event.data;

      if (data.type === 'ready') {
        setStatus('ready');
        return;
      }

      const pending = pendingRef.current.get(data.id);
      if (pending) {
        pendingRef.current.delete(data.id);
        pending.resolve(data);
      }
    };

    worker.onerror = () => {
      setStatus('error');
    };
  }, []);

  useEffect(() => {
    initWorker();

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, [initWorker]);

  const runCode = useCallback(async (code: string, timeout = 5000): Promise<PyodideResult> => {
    if (!workerRef.current || status !== 'ready') {
      return {
        id: '',
        success: false,
        output: '',
        error: 'Python 运行环境尚未就绪',
        duration: 0,
      };
    }

    const id = `py-${++globalId}`;

    return new Promise((resolve) => {
      pendingRef.current.set(id, { resolve, reject: () => {} });
      workerRef.current!.postMessage({ id, type: 'run', code, timeout });

      // Safety timeout — if worker is blocked (e.g. infinite loop),
      // terminate and recreate it so subsequent runs work
      setTimeout(() => {
        if (pendingRef.current.has(id)) {
          pendingRef.current.delete(id);
          resolve({
            id,
            success: false,
            output: '',
            error: '代码执行超时（可能存在无限循环）。Python环境已重置。',
            duration: timeout,
          });
          // Terminate the blocked worker and create a fresh one
          initWorker();
        }
      }, timeout + 1000);
    });
  }, [status, initWorker]);

  return {
    status,
    isReady: status === 'ready',
    isLoading: status === 'loading',
    runCode,
  };
}
