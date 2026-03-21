import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FillBlankEditor } from '../FillBlankEditor';
import type { Challenge } from '@/lib/levels/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      animate,
      transition,
      initial,
      whileHover,
      whileTap,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      animate,
      transition,
      layout,
      initial,
      exit,
      whileHover,
      whileTap,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

/** Challenge with choices (dropdown blanks) */
const challengeWithChoices: Challenge = {
  id: 'fill-test-1',
  type: 'fill_blank',
  prompt: '请填写正确的Python代码来输出问候语',
  codeTemplate: 'print(___)',
  correctAnswer: 'print("你好")',
  testCases: [
    { expectedOutput: '你好', description: '输出你好' },
  ],
  hints: ['使用print函数', '字符串需要引号', 'print("你好")'],
  qiReward: 25,
  choices: ['"你好"', '"再见"', '"世界"'],
};

/** Challenge without choices (text input blanks) */
const challengeWithoutChoices: Challenge = {
  id: 'fill-test-2',
  type: 'fill_blank',
  prompt: '补全代码，定义一个变量',
  codeTemplate: '___ = 42',
  correctAnswer: 'x = 42',
  testCases: [
    { expectedOutput: '42', description: '变量值为42' },
  ],
  hints: ['变量名可以是任意字母', '试试 x', 'x = 42'],
  qiReward: 25,
};

/** Challenge with multiple blanks */
const challengeMultipleBlanks: Challenge = {
  id: 'fill-test-3',
  type: 'fill_blank',
  prompt: '补全代码，输出两行文字',
  codeTemplate: 'print(___)\nprint(___)',
  correctAnswer: 'print("你好")\nprint("世界")',
  testCases: [
    { expectedOutput: '你好\n世界', description: '输出两行' },
  ],
  hints: ['每个print输出一行', '第一行是你好', 'print("你好")和print("世界")'],
  qiReward: 25,
  choices: ['"你好"', '"世界"', '"再见"'],
};

describe('FillBlankEditor', () => {
  it('renders challenge prompt text', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} />);

    expect(screen.getByText('请填写正确的Python代码来输出问候语')).toBeInTheDocument();
  });

  it('renders choice buttons when choices are provided', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} />);

    const blankArea = screen.getByTestId('blank-select-0');
    expect(blankArea).toBeInTheDocument();
    // Should show clickable choice buttons
    expect(screen.getByText('点击选择')).toBeInTheDocument();
    expect(screen.getByTestId('choice-0-0')).toBeInTheDocument();
  });

  it('renders text inputs when no choices are provided', () => {
    render(<FillBlankEditor challenge={challengeWithoutChoices} onSubmit={vi.fn()} />);

    const input = screen.getByTestId('blank-input-0');
    expect(input).toBeInTheDocument();
    expect(input.tagName.toLowerCase()).toBe('input');
  });

  it('submit button is disabled when blanks are empty', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} />);

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    expect(submitBtn).toBeDisabled();
  });

  it('submit button is enabled when all blanks are filled', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} />);

    // Click the first choice button to fill the blank
    fireEvent.click(screen.getByTestId('choice-0-0'));

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onSubmit with assembled code when submitted', () => {
    const onSubmit = vi.fn();
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={onSubmit} />);

    // Click choice button to fill blank
    fireEvent.click(screen.getByTestId('choice-0-0'));

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith('print("你好")');
  });

  it('handles multiple blanks in one template', () => {
    const onSubmit = vi.fn();
    render(<FillBlankEditor challenge={challengeMultipleBlanks} onSubmit={onSubmit} />);

    // Should have two blank areas
    expect(screen.getByTestId('blank-select-0')).toBeInTheDocument();
    expect(screen.getByTestId('blank-select-1')).toBeInTheDocument();

    // Fill both blanks by clicking choice buttons
    fireEvent.click(screen.getByTestId('choice-0-0')); // "你好"
    fireEvent.click(screen.getByTestId('choice-1-1')); // "世界"

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith('print("你好")\nprint("世界")');
  });

  it('submit button text is "提交答案"', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: '提交答案' })).toBeInTheDocument();
  });

  it('falls back to correctAnswer as template when codeTemplate is missing', () => {
    const challengeNoTemplate: Challenge = {
      id: 'fill-no-tpl',
      type: 'fill_blank',
      prompt: 'No template challenge',
      // no codeTemplate — should fall back to correctAnswer
      correctAnswer: 'x = ___',
      testCases: [{ expectedOutput: '42', description: 'test' }],
      hints: ['hint'],
      qiReward: 25,
    };

    render(<FillBlankEditor challenge={challengeNoTemplate} onSubmit={vi.fn()} />);

    // The blank should still be parsed from the correctAnswer fallback
    const input = screen.getByTestId('blank-input-0');
    expect(input).toBeInTheDocument();
  });

  it('respects disabled state', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} disabled />);

    // Choice buttons should not appear when disabled
    expect(screen.queryByTestId('choice-0-0')).not.toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    expect(submitBtn).toBeDisabled();
  });
});
