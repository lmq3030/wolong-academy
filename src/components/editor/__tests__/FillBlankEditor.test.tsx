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

  it('renders dropdowns when choices are provided', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} />);

    const select = screen.getByTestId('blank-select-0');
    expect(select).toBeInTheDocument();
    expect(select.tagName.toLowerCase()).toBe('select');
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

    const select = screen.getByTestId('blank-select-0');
    fireEvent.change(select, { target: { value: '"你好"' } });

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    expect(submitBtn).not.toBeDisabled();
  });

  it('calls onSubmit with assembled code when submitted', () => {
    const onSubmit = vi.fn();
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={onSubmit} />);

    const select = screen.getByTestId('blank-select-0');
    fireEvent.change(select, { target: { value: '"你好"' } });

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith('print("你好")');
  });

  it('handles multiple blanks in one template', () => {
    const onSubmit = vi.fn();
    render(<FillBlankEditor challenge={challengeMultipleBlanks} onSubmit={onSubmit} />);

    // Should have two select dropdowns
    const select0 = screen.getByTestId('blank-select-0');
    const select1 = screen.getByTestId('blank-select-1');
    expect(select0).toBeInTheDocument();
    expect(select1).toBeInTheDocument();

    // Fill both blanks
    fireEvent.change(select0, { target: { value: '"你好"' } });
    fireEvent.change(select1, { target: { value: '"世界"' } });

    const submitBtn = screen.getByRole('button', { name: '提交答案' });
    expect(submitBtn).not.toBeDisabled();
    fireEvent.click(submitBtn);

    expect(onSubmit).toHaveBeenCalledWith('print("你好")\nprint("世界")');
  });

  it('submit button text is "提交答案"', () => {
    render(<FillBlankEditor challenge={challengeWithChoices} onSubmit={vi.fn()} />);

    expect(screen.getByRole('button', { name: '提交答案' })).toBeInTheDocument();
  });
});
