import type { Challenge, TestCase } from '@/lib/levels/types';
import type { ValidationResult } from './types';

function normalizeCode(code: string): string {
  return code.split('\n').map(line => line.trimEnd()).join('\n').trim();
}

export function validateStatic(code: string, challenge: Challenge): ValidationResult {
  const normalized = normalizeCode(code);
  const expected = normalizeCode(challenge.correctAnswer);

  if (normalized === expected) {
    return { correct: true, output: '' };
  }

  // Try to give a helpful error message
  return {
    correct: false,
    output: '',
    error: '代码还不太对，再检查一下吧！',
  };
}

export async function validateDynamic(
  code: string,
  testCases: TestCase[],
  runCode: (code: string) => Promise<{ success: boolean; output: string; error?: string }>
): Promise<ValidationResult> {
  const result = await runCode(code);

  if (!result.success) {
    // Extract line number from Python error
    const lineMatch = result.error?.match(/line (\d+)/);
    const lineNumber = lineMatch ? parseInt(lineMatch[1]) : undefined;

    return {
      correct: false,
      output: result.output,
      error: result.error || '代码运行出错了',
      lineNumber,
    };
  }

  // Check against test cases
  for (const testCase of testCases) {
    if (result.output.trim() !== testCase.expectedOutput.trim()) {
      return {
        correct: false,
        output: result.output,
        error: `期望输出：${testCase.expectedOutput.trim()}\n实际输出：${result.output.trim()}`,
      };
    }
  }

  return { correct: true, output: result.output };
}
