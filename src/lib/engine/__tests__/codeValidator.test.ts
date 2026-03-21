import { describe, it, expect, vi } from 'vitest';
import { validateStatic, validateDynamic } from '../codeValidator';
import type { Challenge } from '@/lib/levels/types';

describe('validateStatic', () => {
  const challenge = {
    correctAnswer: 'print("hello")',
  } as Challenge;

  it('accepts exact match', () => {
    const result = validateStatic('print("hello")', challenge);
    expect(result.correct).toBe(true);
  });

  it('accepts match with trailing whitespace', () => {
    const result = validateStatic('print("hello")  \n', challenge);
    expect(result.correct).toBe(true);
  });

  it('rejects wrong code', () => {
    const result = validateStatic('print("bye")', challenge);
    expect(result.correct).toBe(false);
    expect(result.error).toBeDefined();
  });
});

describe('validateDynamic', () => {
  it('validates correct output', async () => {
    const mockRunCode = vi.fn().mockResolvedValue({
      success: true,
      output: 'hello\n',
    });

    const result = await validateDynamic(
      'print("hello")',
      [{ expectedOutput: 'hello\n', description: 'prints hello' }],
      mockRunCode
    );

    expect(result.correct).toBe(true);
  });

  it('catches wrong output', async () => {
    const mockRunCode = vi.fn().mockResolvedValue({
      success: true,
      output: 'bye\n',
    });

    const result = await validateDynamic(
      'print("bye")',
      [{ expectedOutput: 'hello\n', description: 'prints hello' }],
      mockRunCode
    );

    expect(result.correct).toBe(false);
    expect(result.error).toContain('期望输出');
  });

  it('handles execution error with line number', async () => {
    const mockRunCode = vi.fn().mockResolvedValue({
      success: false,
      output: '',
      error: 'NameError: name "prin" is not defined\n  File "<exec>", line 3',
    });

    const result = await validateDynamic(
      'prin("hello")',
      [{ expectedOutput: 'hello\n', description: 'prints hello' }],
      mockRunCode
    );

    expect(result.correct).toBe(false);
    expect(result.lineNumber).toBe(3);
  });

  it('handles timeout error', async () => {
    const mockRunCode = vi.fn().mockResolvedValue({
      success: false,
      output: '',
      error: '代码执行超时',
    });

    const result = await validateDynamic(
      'while True: pass',
      [{ expectedOutput: '', description: '' }],
      mockRunCode
    );

    expect(result.correct).toBe(false);
    expect(result.error).toContain('超时');
  });
});
