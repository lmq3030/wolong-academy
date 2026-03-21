import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorFeedback } from '../ErrorFeedback';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
    p: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <p {...props}>{children}</p>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('ErrorFeedback', () => {
  const defaultProps = {
    message: '变量名未定义',
    onDismiss: vi.fn(),
  };

  it('renders error message text', () => {
    render(<ErrorFeedback {...defaultProps} />);
    expect(screen.getByText(/变量名未定义/)).toBeInTheDocument();
  });

  it('wraps message in advisor speech pattern', () => {
    render(<ErrorFeedback {...defaultProps} message="语法错误" />);
    // The message is wrapped: 军师摇了摇羽扇："语法错误"
    expect(screen.getByText(/军师摇了摇羽扇/)).toBeInTheDocument();
    expect(screen.getByText(/语法错误/)).toBeInTheDocument();
  });

  it('shows line number when provided', () => {
    render(<ErrorFeedback {...defaultProps} lineNumber={5} />);
    expect(screen.getByText(/第5行的阵法还需调整/)).toBeInTheDocument();
  });

  it('does not show line number when not provided', () => {
    render(<ErrorFeedback {...defaultProps} />);
    expect(screen.queryByText(/阵法还需调整/)).not.toBeInTheDocument();
  });

  it('shows "再试一次" button', () => {
    render(<ErrorFeedback {...defaultProps} />);
    expect(screen.getByText('再试一次')).toBeInTheDocument();
  });

  it('calls onDismiss when "再试一次" button is clicked', () => {
    const onDismiss = vi.fn();
    render(<ErrorFeedback {...defaultProps} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('再试一次'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when backdrop is clicked', () => {
    const onDismiss = vi.fn();
    const { container } = render(
      <ErrorFeedback {...defaultProps} onDismiss={onDismiss} />
    );
    // The backdrop is the first child div with bg-black/20 class
    const backdrop = container.querySelector('.bg-black\\/20');
    expect(backdrop).toBeInTheDocument();
    fireEvent.click(backdrop!);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('shows advisor portrait with "诸葛" text', () => {
    render(<ErrorFeedback {...defaultProps} />);
    expect(screen.getByText('诸葛')).toBeInTheDocument();
  });
});
