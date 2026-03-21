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

  useEffect(() => {
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

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

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

      // Safety timeout (worker timeout + buffer)
      setTimeout(() => {
        if (pendingRef.current.has(id)) {
          pendingRef.current.delete(id);
          resolve({
            id,
            success: false,
            output: '',
            error: '代码执行超时',
            duration: timeout,
          });
        }
      }, timeout + 1000);
    });
  }, [status]);

  return {
    status,
    isReady: status === 'ready',
    isLoading: status === 'loading',
    runCode,
  };
}
