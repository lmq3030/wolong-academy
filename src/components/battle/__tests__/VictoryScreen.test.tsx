import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VictoryScreen } from '../VictoryScreen';
import type { ChapterRewards } from '@/lib/levels/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, initial, animate, exit, transition, whileHover, whileTap, ...props }: any) => (
      <button {...props}>{children}</button>
    ),
    span: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
    p: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <p {...props}>{children}</p>
    ),
    h1: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <h1 {...props}>{children}</h1>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const baseRewards: ChapterRewards = {
  xp: 150,
};

describe('VictoryScreen', () => {
  it('shows victory header text', () => {
    render(
      <VictoryScreen rewards={baseRewards} stars={3} onContinue={vi.fn()} />
    );
    expect(screen.getByText(/大获全胜/)).toBeInTheDocument();
  });

  it('displays correct number of filled stars for 3 stars', () => {
    const { container } = render(
      <VictoryScreen rewards={baseRewards} stars={3} onContinue={vi.fn()} />
    );
    const starSvgs = container.querySelectorAll('svg[viewBox="0 0 24 24"]');
    expect(starSvgs).toHaveLength(3);
    // All 3 should be filled (fill="var(--color-gold)")
    const filledStars = Array.from(starSvgs).filter(
      (svg) => svg.getAttribute('fill') === 'var(--color-gold)'
    );
    expect(filledStars).toHaveLength(3);
  });

  it('displays correct number of filled stars for 2 stars', () => {
    const { container } = render(
      <VictoryScreen rewards={baseRewards} stars={2} onContinue={vi.fn()} />
    );
    const starSvgs = container.querySelectorAll('svg[viewBox="0 0 24 24"]');
    const filledStars = Array.from(starSvgs).filter(
      (svg) => svg.getAttribute('fill') === 'var(--color-gold)'
    );
    const emptyStars = Array.from(starSvgs).filter(
      (svg) => svg.getAttribute('fill') === '#ccc'
    );
    expect(filledStars).toHaveLength(2);
    expect(emptyStars).toHaveLength(1);
  });

  it('displays correct number of filled stars for 1 star', () => {
    const { container } = render(
      <VictoryScreen rewards={baseRewards} stars={1} onContinue={vi.fn()} />
    );
    const starSvgs = container.querySelectorAll('svg[viewBox="0 0 24 24"]');
    const filledStars = Array.from(starSvgs).filter(
      (svg) => svg.getAttribute('fill') === 'var(--color-gold)'
    );
    expect(filledStars).toHaveLength(1);
  });

  it('shows XP reward label', () => {
    render(
      <VictoryScreen rewards={baseRewards} stars={3} onContinue={vi.fn()} />
    );
    expect(screen.getByText('经验值 +')).toBeInTheDocument();
  });

  it('shows unlocked general names when rewards include them', () => {
    const rewardsWithGenerals: ChapterRewards = {
      xp: 100,
      unlockGenerals: ['guan-yu', 'zhang-fei'],
    };
    render(
      <VictoryScreen
        rewards={rewardsWithGenerals}
        stars={3}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText('解锁武将')).toBeInTheDocument();
    // Each general shows first char uppercased: 'G' for guan-yu, 'Z' for zhang-fei
    expect(screen.getByText('G')).toBeInTheDocument();
    expect(screen.getByText('Z')).toBeInTheDocument();
  });

  it('does not show unlocked generals section when no generals', () => {
    render(
      <VictoryScreen rewards={baseRewards} stars={3} onContinue={vi.fn()} />
    );
    expect(screen.queryByText('解锁武将')).not.toBeInTheDocument();
  });

  it('does not show unlocked generals when array is empty', () => {
    const rewardsEmptyGenerals: ChapterRewards = {
      xp: 100,
      unlockGenerals: [],
    };
    render(
      <VictoryScreen
        rewards={rewardsEmptyGenerals}
        stars={3}
        onContinue={vi.fn()}
      />
    );
    expect(screen.queryByText('解锁武将')).not.toBeInTheDocument();
  });

  it('shows quote when rewards include one', () => {
    const rewardsWithQuote: ChapterRewards = {
      xp: 100,
      quote: '知己知彼，百战不殆',
    };
    render(
      <VictoryScreen
        rewards={rewardsWithQuote}
        stars={3}
        onContinue={vi.fn()}
      />
    );
    expect(screen.getByText(/知己知彼，百战不殆/)).toBeInTheDocument();
  });

  it('does not show quote section when quote is not provided', () => {
    render(
      <VictoryScreen rewards={baseRewards} stars={3} onContinue={vi.fn()} />
    );
    // No italic quote element should exist
    expect(screen.queryByText(/\u201c/)).not.toBeInTheDocument();
  });

  it('has "继续" button that calls onContinue', () => {
    const onContinue = vi.fn();
    render(
      <VictoryScreen rewards={baseRewards} stars={3} onContinue={onContinue} />
    );
    const continueBtn = screen.getByText('继续');
    expect(continueBtn).toBeInTheDocument();
    fireEvent.click(continueBtn);
    expect(onContinue).toHaveBeenCalledTimes(1);
  });

  it('clamps stars to max 3', () => {
    const { container } = render(
      <VictoryScreen rewards={baseRewards} stars={5} onContinue={vi.fn()} />
    );
    const starSvgs = container.querySelectorAll('svg[viewBox="0 0 24 24"]');
    // Should still be exactly 3 star SVGs rendered
    expect(starSvgs).toHaveLength(3);
    const filledStars = Array.from(starSvgs).filter(
      (svg) => svg.getAttribute('fill') === 'var(--color-gold)'
    );
    expect(filledStars).toHaveLength(3);
  });
});
