import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SkillAnimation } from '../SkillAnimation';

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
    }: any) => <div {...props}>{children}</div>,
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
    }: any) => <button {...props}>{children}</button>,
    p: ({
      children,
      initial,
      animate,
      exit,
      transition,
      ...props
    }: any) => <p {...props}>{children}</p>,
    h1: ({
      children,
      initial,
      animate,
      exit,
      transition,
      ...props
    }: any) => <h1 {...props}>{children}</h1>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('SkillAnimation', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders skill name text', () => {
    render(<SkillAnimation skillName="连弩激射" onComplete={vi.fn()} />);
    expect(screen.getByText('连弩激射')).toBeInTheDocument();
  });

  it('shows "大获全胜！" text', () => {
    render(<SkillAnimation skillName="落日弓" onComplete={vi.fn()} />);
    expect(screen.getByText('大获全胜！')).toBeInTheDocument();
  });

  it('calls onComplete after 3 second timeout', () => {
    const onComplete = vi.fn();
    render(<SkillAnimation skillName="火攻计" onComplete={onComplete} />);

    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2999);
    expect(onComplete).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('cleans up timer on unmount', () => {
    const onComplete = vi.fn();
    const { unmount } = render(
      <SkillAnimation skillName="双股剑法" onComplete={onComplete} />
    );

    unmount();
    vi.advanceTimersByTime(5000);
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('renders with arrow-type skill name (弓/箭/弩 keywords)', () => {
    const { container } = render(
      <SkillAnimation skillName="落日弓" onComplete={vi.fn()} />
    );
    expect(screen.getByText('落日弓')).toBeInTheDocument();
    // Arrow effect renders 8 arrow lines as divs
    expect(container.querySelector('.pointer-events-none')).toBeInTheDocument();
  });

  it('renders with fire-type skill name (火/焰/龙 keywords)', () => {
    render(<SkillAnimation skillName="火攻计" onComplete={vi.fn()} />);
    expect(screen.getByText('火攻计')).toBeInTheDocument();
  });

  it('renders with slash-type skill name (剑/斩/刀 keywords)', () => {
    render(<SkillAnimation skillName="双股剑法" onComplete={vi.fn()} />);
    expect(screen.getByText('双股剑法')).toBeInTheDocument();
  });

  it('renders with golden burst for default skill names', () => {
    render(<SkillAnimation skillName="空城计" onComplete={vi.fn()} />);
    expect(screen.getByText('空城计')).toBeInTheDocument();
  });

  it('renders different skills without errors', () => {
    const skills = ['连弩激射', '火焰连环', '青龙偃月刀', '八阵图'];
    skills.forEach((skill) => {
      const { unmount } = render(
        <SkillAnimation skillName={skill} onComplete={vi.fn()} />
      );
      expect(screen.getByText(skill)).toBeInTheDocument();
      unmount();
    });
  });
});
