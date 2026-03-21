import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FreeCodeEditor } from '../FreeCodeEditor';
import type { Challenge } from '@/lib/levels/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      initial,
      animate,
      exit,
      transition,
      ...props
    }: React.HTMLAttributes<HTMLDivElement> & Record<string, unknown>) => (
      <div {...props}>{children}</div>
    ),
    button: ({
      children,
      initial,
      animate,
      exit,
      transition,
      whileHover,
      whileTap,
      layout,
      ...props
    }: React.ButtonHTMLAttributes<HTMLButtonElement> & Record<string, unknown>) => (
      <button {...props}>{children}</button>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const baseChallenge: Challenge = {
  id: 'test-free-code',
  type: 'free_code',
  prompt: '写一个程序输出你的名字',
  correctAnswer: 'print("刘备")',
  testCases: [{ expectedOutput: '刘备', description: '输出名字' }],
  hints: ['用 print()', '用双引号', 'print("刘备")'],
  qiReward: 50,
};

const challengeWithTemplate: Challenge = {
  ...baseChallenge,
  id: 'test-with-template',
  codeTemplate: 'print("hello")\nprint("world")',
};

describe('FreeCodeEditor', () => {
  it('renders challenge prompt', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    expect(screen.getByText('写一个程序输出你的名字')).toBeInTheDocument();
  });

  it('pre-fills textarea with codeTemplate when provided', () => {
    render(
      <FreeCodeEditor challenge={challengeWithTemplate} onSubmit={vi.fn()} />
    );
    const textarea = screen.getByTestId('code-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('print("hello")\nprint("world")');
  });

  it('shows empty textarea when no codeTemplate', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    const textarea = screen.getByTestId('code-textarea') as HTMLTextAreaElement;
    expect(textarea.value).toBe('');
  });

  it('Tab key inserts 4 spaces at cursor position', () => {
    render(
      <FreeCodeEditor challenge={challengeWithTemplate} onSubmit={vi.fn()} />
    );
    const textarea = screen.getByTestId('code-textarea') as HTMLTextAreaElement;

    // Set cursor position at start
    textarea.selectionStart = 0;
    textarea.selectionEnd = 0;

    fireEvent.keyDown(textarea, { key: 'Tab' });

    // The code should now start with 4 spaces
    expect(textarea.value).toContain('    print("hello")');
  });

  it('submit button calls onSubmit with textarea content', () => {
    const onSubmit = vi.fn();
    render(
      <FreeCodeEditor challenge={challengeWithTemplate} onSubmit={onSubmit} />
    );

    const submitButton = screen.getByRole('button', { name: /运行代码/ });
    fireEvent.click(submitButton);

    expect(onSubmit).toHaveBeenCalledWith('print("hello")\nprint("world")');
  });

  it('submit button text is "运行代码"', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    expect(screen.getByText('运行代码')).toBeInTheDocument();
  });

  it('line numbers update as content changes', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    const textarea = screen.getByTestId('code-textarea');

    // Initially empty -> 1 line
    expect(screen.getByText('1')).toBeInTheDocument();

    // Type multiline content
    fireEvent.change(textarea, {
      target: { value: 'line1\nline2\nline3' },
    });

    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('textarea has monospace font styling', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    const textarea = screen.getByTestId('code-textarea');
    expect(textarea.className).toContain('font-mono');
  });

  it('disabled prop disables textarea and button', () => {
    render(
      <FreeCodeEditor
        challenge={baseChallenge}
        onSubmit={vi.fn()}
        disabled={true}
      />
    );
    const textarea = screen.getByTestId('code-textarea');
    const button = screen.getByRole('button', { name: /运行代码/ });

    expect(textarea).toBeDisabled();
    expect(button).toBeDisabled();
  });

  it('disabled prop prevents onSubmit from being called', () => {
    const onSubmit = vi.fn();
    render(
      <FreeCodeEditor
        challenge={baseChallenge}
        onSubmit={onSubmit}
        disabled={true}
      />
    );
    const button = screen.getByRole('button', { name: /运行代码/ });
    fireEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
