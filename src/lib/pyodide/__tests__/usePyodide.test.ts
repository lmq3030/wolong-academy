import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePyodide } from '../usePyodide';

// Mock Worker
class MockWorker {
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: ErrorEvent) => void) | null = null;

  constructor() {
    // Simulate ready after short delay
    setTimeout(() => {
      this.onmessage?.({ data: { type: 'ready' } } as MessageEvent);
    }, 10);
  }

  postMessage(data: any) {
    // Simulate Python execution
    if (data.type === 'run') {
      setTimeout(() => {
        if (data.code.includes('syntax_error')) {
          this.onmessage?.({
            data: {
              id: data.id,
              success: false,
              output: '',
              error: 'SyntaxError: invalid syntax',
              duration: 5,
            },
          } as MessageEvent);
        } else if (data.code.includes('infinite')) {
          // Don't respond (simulate timeout)
        } else {
          // Simulate print output
          const match = data.code.match(/print\(["'](.+?)["']\)/);
          const output = match ? match[1] + '\n' : '';
          this.onmessage?.({
            data: {
              id: data.id,
              success: true,
              output,
              duration: 10,
            },
          } as MessageEvent);
        }
      }, 10);
    }
  }

  terminate() {}
}

// Mock global Worker
vi.stubGlobal('Worker', MockWorker);

describe('usePyodide', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  it('initializes and becomes ready', async () => {
    const { result } = renderHook(() => usePyodide());
    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isReady).toBe(true));
  });

  it('runs print("hello") and captures output', async () => {
    const { result } = renderHook(() => usePyodide());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let pyResult: any;
    await act(async () => {
      pyResult = await result.current.runCode('print("hello")');
    });
    expect(pyResult!.success).toBe(true);
    expect(pyResult!.output).toBe('hello\n');
  });

  it('handles syntax errors gracefully', async () => {
    const { result } = renderHook(() => usePyodide());
    await waitFor(() => expect(result.current.isReady).toBe(true));

    let pyResult: any;
    await act(async () => {
      pyResult = await result.current.runCode('syntax_error!!!');
    });
    expect(pyResult!.success).toBe(false);
    expect(pyResult!.error).toContain('SyntaxError');
  });

  it('returns error when not ready', async () => {
    // Create a worker that never becomes ready
    vi.stubGlobal('Worker', class {
      onmessage: any = null;
      onerror: any = null;
      postMessage() {}
      terminate() {}
    });

    const { result } = renderHook(() => usePyodide());
    // Call immediately before ready
    let pyResult: any;
    await act(async () => {
      pyResult = await result.current.runCode('print("test")');
    });
    expect(pyResult!.success).toBe(false);
    expect(pyResult!.error).toContain('尚未就绪');

    // Restore original mock for subsequent tests
    vi.stubGlobal('Worker', MockWorker);
  });
});
