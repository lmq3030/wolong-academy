import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CityNode } from '../CityNode';
import type { Chapter } from '@/lib/levels';

// Mock next/navigation
const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
}));

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    circle: ({
      children,
      animate,
      transition,
      initial,
      ...props
    }: React.SVGAttributes<SVGCircleElement> & Record<string, unknown>) => (
      <circle {...props}>{children}</circle>
    ),
    text: ({
      children,
      animate,
      transition,
      initial,
      ...props
    }: React.SVGAttributes<SVGTextElement> & Record<string, unknown>) => (
      <text {...props}>{children}</text>
    ),
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockChapter: Chapter = {
  id: 'ch-1',
  act: 1,
  title: '桃园三结义',
  storyIntro: '故事开始...',
  pythonConcept: 'print() 基础输出',
  difficulty: 1,
  interactionMode: 'drag',
  challenges: [],
  battle: {
    playerGeneral: 'liu-bei',
    playerSkill: '双股剑法',
    bgScene: '/scenes/peach-garden.webp',
  },
  rewards: {
    xp: 100,
  },
};

// Helper to wrap SVG elements for proper rendering
function renderCityNode(
  props: Partial<React.ComponentProps<typeof CityNode>> = {}
) {
  const defaultProps = {
    chapter: mockChapter,
    status: 'current' as const,
    stars: 0,
    x: 100,
    y: 100,
  };
  return render(
    <svg>
      <CityNode {...defaultProps} {...props} />
    </svg>
  );
}

describe('CityNode', () => {
  beforeEach(() => {
    pushMock.mockClear();
  });

  it('renders chapter title', () => {
    renderCityNode();

    expect(screen.getByText('桃园三结义')).toBeInTheDocument();
  });

  it('completed status shows checkmark via path element', () => {
    const { container } = renderCityNode({ status: 'completed', stars: 3 });

    // Checkmark is rendered as a <path> with specific stroke attributes
    const paths = container.querySelectorAll('path');
    const checkmarkPath = Array.from(paths).find(
      (p) =>
        p.getAttribute('stroke') === 'white' &&
        p.getAttribute('stroke-linecap') === 'round'
    );
    expect(checkmarkPath).toBeTruthy();
  });

  it('completed status shows stars', () => {
    renderCityNode({ status: 'completed', stars: 2 });

    // Stars are rendered as text elements with star character
    const starElements = screen.getAllByText('\u2605');
    expect(starElements).toHaveLength(3); // always renders 3 star positions
  });

  it('current status shows "攻城!" label', () => {
    renderCityNode({ status: 'current' });

    expect(screen.getByText('攻城!')).toBeInTheDocument();
  });

  it('current status shows pulsing effect (animated circle)', () => {
    const { container } = renderCityNode({ status: 'current' });

    // The pulsing effect is a motion.circle with stroke="var(--color-gold)"
    const circles = container.querySelectorAll('circle');
    const pulsingCircle = Array.from(circles).find(
      (c) => c.getAttribute('stroke') === 'var(--color-gold)' && c.getAttribute('fill') === 'none'
    );
    expect(pulsingCircle).toBeTruthy();
  });

  it('locked status shows lock icon', () => {
    const { container } = renderCityNode({ status: 'locked' });

    // Lock icon has a rect and a path inside a <g> transform group
    const rects = container.querySelectorAll('rect');
    const lockRect = Array.from(rects).find(
      (r) => r.getAttribute('fill') === 'white' && r.getAttribute('opacity') === '0.7'
    );
    expect(lockRect).toBeTruthy();
  });

  it('click on current calls router.push', () => {
    renderCityNode({ status: 'current' });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith('/battle/ch-1');
  });

  it('click on completed calls router.push', () => {
    renderCityNode({ status: 'completed', stars: 2 });

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith('/battle/ch-1');
  });

  it('click on locked does NOT trigger navigation', () => {
    renderCityNode({ status: 'locked' });

    const group = screen.getByRole('button');
    fireEvent.click(group);

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('supports keyboard navigation (Enter/Space) for unlocked nodes', () => {
    renderCityNode({ status: 'current' });

    const button = screen.getByRole('button');

    // Enter key triggers navigation
    fireEvent.keyDown(button, { key: 'Enter' });
    expect(pushMock).toHaveBeenCalledWith('/battle/ch-1');

    pushMock.mockClear();

    // Space key triggers navigation
    fireEvent.keyDown(button, { key: ' ' });
    expect(pushMock).toHaveBeenCalledWith('/battle/ch-1');

    pushMock.mockClear();

    // Also works for completed nodes
    const { unmount } = renderCityNode({ status: 'completed', stars: 2 });
    const completedButtons = screen.getAllByRole('button');
    // The second button is the newly rendered completed node
    fireEvent.keyDown(completedButtons[completedButtons.length - 1], { key: 'Enter' });
    expect(pushMock).toHaveBeenCalledWith('/battle/ch-1');
  });

  it('shows correct number of filled stars for completed chapters', () => {
    const { container } = renderCityNode({ status: 'completed', stars: 2 });

    // 3 star text elements total; 2 filled with gold color, 1 grey
    const starElements = container.querySelectorAll('text');
    const goldStars = Array.from(starElements).filter(
      (el) => el.getAttribute('fill') === 'var(--color-gold)' && el.textContent === '\u2605'
    );
    const greyStars = Array.from(starElements).filter(
      (el) => el.getAttribute('fill') === '#D1D5DB' && el.textContent === '\u2605'
    );

    expect(goldStars).toHaveLength(2);
    expect(greyStars).toHaveLength(1);
  });
});
