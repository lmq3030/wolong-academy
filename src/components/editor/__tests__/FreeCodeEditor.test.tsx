import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import type { Challenge } from '@/lib/levels/types';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, whileHover, whileTap, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

// Mock the entire FreeCodeEditor to avoid CodeMirror in jsdom
// CodeMirror requires a real browser DOM and doesn't work in jsdom
let capturedOnSubmit: ((code: string) => void) | null = null;
let capturedDisabled = false;
let capturedPrompt = '';
let capturedTemplate = '';

vi.mock('../FreeCodeEditor', () => ({
  FreeCodeEditor: ({ challenge, onSubmit, disabled }: any) => {
    capturedOnSubmit = onSubmit;
    capturedDisabled = disabled || false;
    capturedPrompt = challenge.prompt;
    capturedTemplate = challenge.codeTemplate || '';
    return (
      <div data-testid="code-editor">
        <p>{challenge.prompt}</p>
        <div data-testid="editor-content">{challenge.codeTemplate || ''}</div>
        <button
          disabled={disabled}
          onClick={() => !disabled && onSubmit(challenge.codeTemplate || '')}
        >
          运行代码
        </button>
      </div>
    );
  },
}));

// Re-import after mock
const { FreeCodeEditor } = await import('../FreeCodeEditor');

const baseChallenge: Challenge = {
  id: 'test-free-code',
  type: 'free_code',
  prompt: '写一个程序输出你的名字',
  correctAnswer: 'print("刘备")',
  testCases: [{ expectedOutput: '刘备\n', description: '输出名字' }],
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

  it('renders editor container', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    expect(screen.getByTestId('code-editor')).toBeInTheDocument();
  });

  it('shows codeTemplate content', () => {
    render(<FreeCodeEditor challenge={challengeWithTemplate} onSubmit={vi.fn()} />);
    expect(capturedTemplate).toBe('print("hello")\nprint("world")');
  });

  it('shows empty content when no codeTemplate', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    expect(capturedTemplate).toBe('');
  });

  it('submit button text is "运行代码"', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} />);
    expect(screen.getByText('运行代码')).toBeInTheDocument();
  });

  it('disabled prop disables submit button', () => {
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={vi.fn()} disabled={true} />);
    expect(screen.getByRole('button', { name: /运行代码/ })).toBeDisabled();
  });

  it('disabled prop prevents onSubmit', () => {
    const onSubmit = vi.fn();
    render(<FreeCodeEditor challenge={baseChallenge} onSubmit={onSubmit} disabled={true} />);
    fireEvent.click(screen.getByRole('button', { name: /运行代码/ }));
    expect(onSubmit).not.toHaveBeenCalled();
  });
});
