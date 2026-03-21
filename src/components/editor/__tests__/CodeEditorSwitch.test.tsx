import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CodeEditorSwitch } from '../CodeEditorSwitch';
import type { Challenge } from '@/lib/levels/types';

// Mock framer-motion
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
    span: ({
      children,
      initial,
      animate,
      ...props
    }: React.HTMLAttributes<HTMLSpanElement> & Record<string, unknown>) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const baseChallengeFields = {
  correctAnswer: 'print("hello")',
  testCases: [{ expectedOutput: 'hello', description: 'output hello' }],
  hints: ['hint1', 'hint2', 'hint3'],
  qiReward: 25,
};

const dragChallenge: Challenge = {
  ...baseChallengeFields,
  id: 'switch-drag',
  type: 'drag',
  prompt: 'Drag test prompt',
  dragOptions: [
    { id: 'opt-1', code: 'print("hello")', isCorrect: true, slot: 0 },
    { id: 'opt-2', code: 'print("bye")', isCorrect: false },
  ],
};

const fillBlankChallenge: Challenge = {
  ...baseChallengeFields,
  id: 'switch-fill',
  type: 'fill_blank',
  prompt: 'Fill blank test prompt',
  codeTemplate: 'print(___)',
  choices: ['"hello"', '"bye"'],
};

const multipleChoiceChallenge: Challenge = {
  ...baseChallengeFields,
  id: 'switch-mc',
  type: 'multiple_choice',
  prompt: 'Multiple choice test prompt',
  codeTemplate: 'print(___)',
  choices: ['"hello"', '"bye"'],
};

const freeCodeChallenge: Challenge = {
  ...baseChallengeFields,
  id: 'switch-free',
  type: 'free_code',
  prompt: 'Free code test prompt',
  codeTemplate: '# write your code here',
};

describe('CodeEditorSwitch', () => {
  it('renders DragDropEditor for challenge.type="drag"', () => {
    render(<CodeEditorSwitch challenge={dragChallenge} onSubmit={vi.fn()} />);

    // DragDropEditor renders drop zones with placeholder text
    expect(screen.getByText('将代码拖到这里')).toBeInTheDocument();
    // Also renders drag options
    expect(screen.getByText('print("hello")')).toBeInTheDocument();
  });

  it('renders FillBlankEditor for challenge.type="fill_blank"', () => {
    render(<CodeEditorSwitch challenge={fillBlankChallenge} onSubmit={vi.fn()} />);

    // FillBlankEditor renders the prompt and a select dropdown
    expect(screen.getByText('Fill blank test prompt')).toBeInTheDocument();
    expect(screen.getByTestId('blank-select-0')).toBeInTheDocument();
  });

  it('renders FillBlankEditor for challenge.type="multiple_choice"', () => {
    render(<CodeEditorSwitch challenge={multipleChoiceChallenge} onSubmit={vi.fn()} />);

    // multiple_choice also uses FillBlankEditor
    expect(screen.getByText('Multiple choice test prompt')).toBeInTheDocument();
    expect(screen.getByTestId('blank-select-0')).toBeInTheDocument();
  });

  it('renders FreeCodeEditor for challenge.type="free_code"', () => {
    render(<CodeEditorSwitch challenge={freeCodeChallenge} onSubmit={vi.fn()} />);

    // FreeCodeEditor renders a textarea with the code template
    expect(screen.getByText('Free code test prompt')).toBeInTheDocument();
    // FreeCodeEditor has a textarea
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('falls back to FreeCodeEditor for unknown challenge type', () => {
    const unknownChallenge = {
      ...baseChallengeFields,
      id: 'switch-unknown',
      type: 'some_future_type' as Challenge['type'], // cast to bypass TS
      prompt: 'Unknown type test prompt',
      codeTemplate: '# unknown type',
    } as Challenge;

    render(<CodeEditorSwitch challenge={unknownChallenge} onSubmit={vi.fn()} />);

    // Should fall back to FreeCodeEditor which renders a textarea
    expect(screen.getByText('Unknown type test prompt')).toBeInTheDocument();
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });
});
