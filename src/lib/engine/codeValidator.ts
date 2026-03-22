import type { Challenge, TestCase } from '@/lib/levels/types';
import type { ValidationResult } from './types';

function normalizeCode(code: string): string {
  return code.split('\n').map(line => line.trimEnd()).join('\n').trim();
}

/**
 * Generate a detailed, kid-friendly error explanation by comparing
 * the user's answer with the correct answer.
 */
function generateDetailedError(submitted: string, challenge: Challenge): string {
  const correct = normalizeCode(challenge.correctAnswer);
  const userCode = normalizeCode(submitted);

  // For fill-blank challenges, find what the user filled vs what's correct
  if (challenge.type === 'fill_blank' && challenge.codeTemplate) {
    const blanks = challenge.codeTemplate.split('___');
    // Extract user's filled values
    let remaining = userCode;
    const userValues: string[] = [];
    for (let i = 0; i < blanks.length - 1; i++) {
      const before = normalizeCode(blanks[i]);
      const after = i < blanks.length - 1 ? normalizeCode(blanks[i + 1]) : '';
      const startIdx = remaining.indexOf(before) + before.length;
      const endIdx = after ? remaining.indexOf(after, startIdx) : remaining.length;
      if (startIdx >= 0 && endIdx >= startIdx) {
        userValues.push(remaining.substring(startIdx, endIdx).trim());
        remaining = remaining.substring(endIdx);
      }
    }

    // Extract correct values
    remaining = correct;
    const correctValues: string[] = [];
    for (let i = 0; i < blanks.length - 1; i++) {
      const before = normalizeCode(blanks[i]);
      const after = i < blanks.length - 1 ? normalizeCode(blanks[i + 1]) : '';
      const startIdx = remaining.indexOf(before) + before.length;
      const endIdx = after ? remaining.indexOf(after, startIdx) : remaining.length;
      if (startIdx >= 0 && endIdx >= startIdx) {
        correctValues.push(remaining.substring(startIdx, endIdx).trim());
        remaining = remaining.substring(endIdx);
      }
    }

    // Compare and explain
    for (let i = 0; i < userValues.length; i++) {
      if (userValues[i] !== correctValues[i]) {
        return `你填入了「${userValues[i]}」，但正确答案是「${correctValues[i]}」。${challenge.hints[1] || '再想想看！'}`;
      }
    }
  }

  // For drag challenges, compare the assembled code
  if (challenge.type === 'drag') {
    const userLines = userCode.split('\n');
    const correctLines = correct.split('\n');
    for (let i = 0; i < Math.max(userLines.length, correctLines.length); i++) {
      if (userLines[i] !== correctLines[i]) {
        return `第${i + 1}行不太对：你写的是「${userLines[i] || '(空)'}」，应该是「${correctLines[i] || '(空)'}」。${challenge.hints[1] || ''}`;
      }
    }
  }

  // Generic fallback with the most helpful hint
  const hints = challenge.hints || [];
  const hint = hints[1] || hints[0] || '';
  return `代码还不太对。${hint}`;
}

export function validateStatic(code: string, challenge: Challenge): ValidationResult {
  const normalized = normalizeCode(code);
  const expected = normalizeCode(challenge.correctAnswer);

  if (normalized === expected) {
    return { correct: true, output: '' };
  }

  return {
    correct: false,
    output: '',
    error: generateDetailedError(code, challenge),
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
