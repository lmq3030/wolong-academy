import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DragDropEditor } from '../DragDropEditor';
import type { Challenge } from '@/lib/levels/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({
      children,
      animate,
      transition,
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

const mockChallenge: Challenge = {
  id: 'test-challenge-1',
  type: 'drag',
  prompt: '把代码块拖到正确的位置，让程序输出"你好，世界"',
  correctAnswer: 'print("你好")\nprint("世界")',
  testCases: [
    {
      expectedOutput: '你好\n世界',
      description: '输出两行文字',
    },
  ],
  hints: ['想想 print() 是做什么的', '先输出"你好"', 'print("你好") 在第一行'],
  qiReward: 30,
  dragOptions: [
    { id: 'opt-1', code: 'print("你好")', isCorrect: true, slot: 0 },
    { id: 'opt-2', code: 'print("世界")', isCorrect: true, slot: 1 },
    { id: 'opt-3', code: 'print("再见")', isCorrect: false },
    { id: 'opt-4', code: 'input("名字")', isCorrect: false },
  ],
};

describe('DragDropEditor', () => {
  it('renders all drag options', () => {
    render(<DragDropEditor challenge={mockChallenge} onSubmit={vi.fn()} />);

    expect(screen.getByText('print("你好")')).toBeInTheDocument();
    expect(screen.getByText('print("世界")')).toBeInTheDocument();
    expect(screen.getByText('print("再见")')).toBeInTheDocument();
    expect(screen.getByText('input("名字")')).toBeInTheDocument();
  });

  it('renders drop zones with placeholder text', () => {
    render(<DragDropEditor challenge={mockChallenge} onSubmit={vi.fn()} />);

    const placeholders = screen.getAllByText('将代码拖到这里');
    expect(placeholders).toHaveLength(2);
  });

  it('renders the challenge prompt', () => {
    render(<DragDropEditor challenge={mockChallenge} onSubmit={vi.fn()} />);

    expect(
      screen.getByText('把代码块拖到正确的位置，让程序输出"你好，世界"')
    ).toBeInTheDocument();
  });

  it('places correct option via click-to-select flow', async () => {
    const onSubmit = vi.fn();
    render(<DragDropEditor challenge={mockChallenge} onSubmit={onSubmit} />);

    // Click to select opt-1
    const option1 = screen.getByTestId('drag-option-opt-1');
    fireEvent.click(option1);

    // Click drop zone 0 to place it
    const dropZone0 = screen.getByTestId('drop-zone-0');
    fireEvent.click(dropZone0);

    // The option code should now appear in the slot
    await waitFor(() => {
      // The drop zone should show the code text
      expect(dropZone0).toHaveTextContent('print("你好")');
    });
  });

  it('rejects incorrect option placement (wrong slot)', async () => {
    render(<DragDropEditor challenge={mockChallenge} onSubmit={vi.fn()} />);

    // Try placing a distractor in slot 0
    const distractor = screen.getByTestId('drag-option-opt-3');
    fireEvent.click(distractor);

    const dropZone0 = screen.getByTestId('drop-zone-0');
    fireEvent.click(dropZone0);

    // The slot should still show placeholder after the shake clears
    await waitFor(() => {
      expect(dropZone0).toHaveTextContent('将代码拖到这里');
    });
  });

  it('rejects correct option placed in wrong slot', async () => {
    render(<DragDropEditor challenge={mockChallenge} onSubmit={vi.fn()} />);

    // opt-1 belongs in slot 0, try placing in slot 1
    const option1 = screen.getByTestId('drag-option-opt-1');
    fireEvent.click(option1);

    const dropZone1 = screen.getByTestId('drop-zone-1');
    fireEvent.click(dropZone1);

    // Should not be placed — still shows placeholder
    await waitFor(() => {
      expect(dropZone1).toHaveTextContent('将代码拖到这里');
    });
  });

  it('calls onSubmit with assembled code when all slots are correctly filled', async () => {
    const onSubmit = vi.fn();
    render(<DragDropEditor challenge={mockChallenge} onSubmit={onSubmit} />);

    // Place opt-1 in slot 0
    fireEvent.click(screen.getByTestId('drag-option-opt-1'));
    fireEvent.click(screen.getByTestId('drop-zone-0'));

    // Place opt-2 in slot 1
    fireEvent.click(screen.getByTestId('drag-option-opt-2'));
    fireEvent.click(screen.getByTestId('drop-zone-1'));

    // onSubmit should be called with the assembled code
    await waitFor(
      () => {
        expect(onSubmit).toHaveBeenCalledWith('print("你好")\nprint("世界")');
      },
      { timeout: 1500 }
    );
  });

  it('calls onPartialProgress with correct percentage', async () => {
    const onPartialProgress = vi.fn();
    render(
      <DragDropEditor
        challenge={mockChallenge}
        onSubmit={vi.fn()}
        onPartialProgress={onPartialProgress}
      />
    );

    // Initially 0%
    expect(onPartialProgress).toHaveBeenCalledWith(0);

    // Place opt-1 in slot 0
    fireEvent.click(screen.getByTestId('drag-option-opt-1'));
    fireEvent.click(screen.getByTestId('drop-zone-0'));

    // Should report 50%
    await waitFor(() => {
      expect(onPartialProgress).toHaveBeenCalledWith(50);
    });
  });

  it('disables interaction when disabled prop is true', () => {
    render(
      <DragDropEditor
        challenge={mockChallenge}
        onSubmit={vi.fn()}
        disabled={true}
      />
    );

    // All option buttons should be disabled
    const buttons = screen.getAllByRole('listitem', { hidden: false });
    const optionButtons = buttons.filter(
      (el) => el.tagName.toLowerCase() === 'button'
    );
    optionButtons.forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });

  it('dims placed options so kids know they are used', async () => {
    render(<DragDropEditor challenge={mockChallenge} onSubmit={vi.fn()} />);

    // Place opt-1 in slot 0
    fireEvent.click(screen.getByTestId('drag-option-opt-1'));
    fireEvent.click(screen.getByTestId('drop-zone-0'));

    // The placed option should be dimmed (opacity-30 class)
    await waitFor(() => {
      const option1 = screen.getByTestId('drag-option-opt-1');
      expect(option1.className).toContain('opacity-30');
    });
  });
});
