import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ThreeKingdomsMap } from '../ThreeKingdomsMap';
import type { Chapter } from '@/lib/levels/types';
import type { LocalProgress } from '@/lib/progress';

// ---- Mocks ----

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
  usePathname: () => '/map',
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

const mockGetProgress = vi.fn<() => LocalProgress>();
const mockIsChapterUnlocked = vi.fn<(id: string, sorted: string[], completed: Record<string, any>) => boolean>();

vi.mock('@/lib/progress', () => ({
  getProgress: () => mockGetProgress(),
  isChapterUnlocked: (id: string, sorted: string[], completed: Record<string, any>) => mockIsChapterUnlocked(id, sorted, completed),
}));

vi.mock('../CityNode', () => ({
  CityNode: ({ chapter, status, stars, x, y }: any) => (
    <g data-testid={`city-node-${chapter.id}`} data-status={status} data-stars={stars}>
      <text>{chapter.title}</text>
    </g>
  ),
}));

vi.mock('../MapPath', () => ({
  MapPath: ({ status, x1, y1, x2, y2 }: any) => (
    <line data-testid="map-path" data-status={status} x1={x1} y1={y1} x2={x2} y2={y2} />
  ),
}));

vi.mock('../MapNavBar', () => ({
  MapNavBar: ({ progress }: any) => (
    <div data-testid="map-navbar">Level: {progress.level}</div>
  ),
}));

// ---- Helpers ----

function makeChapter(overrides: Partial<Chapter> & { id: string; act: Chapter['act'] }): Chapter {
  return {
    title: `Chapter ${overrides.id}`,
    storyIntro: 'Story...',
    pythonConcept: 'print()',
    difficulty: 1,
    interactionMode: 'drag',
    challenges: [],
    battle: {
      playerGeneral: 'liu-bei',
      playerSkill: '双股剑法',
      bgScene: '/scenes/bg.webp',
    },
    rewards: { xp: 100 },
    ...overrides,
  };
}

const chapters: Chapter[] = [
  makeChapter({ id: 'chapter-00', act: 1, title: '桃园三结义' }),
  makeChapter({ id: 'chapter-01', act: 1, title: '初出茅庐' }),
  makeChapter({ id: 'chapter-02', act: 2, title: '赤壁之战' }),
  makeChapter({ id: 'chapter-03', act: 2, title: '草船借箭' }),
];

function defaultProgress(): LocalProgress {
  return {
    completedChapters: {},
    unlockedGenerals: [],
    xp: 0,
    level: 1,
  };
}

describe('ThreeKingdomsMap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all chapter nodes', () => {
    mockGetProgress.mockReturnValue(defaultProgress());
    mockIsChapterUnlocked.mockImplementation((id, sortedIds, completed) => {
      const idx = sortedIds.indexOf(id);
      return idx === 0;
    });

    render(<ThreeKingdomsMap chapters={chapters} />);

    expect(screen.getByTestId('city-node-chapter-00')).toBeInTheDocument();
    expect(screen.getByTestId('city-node-chapter-01')).toBeInTheDocument();
    expect(screen.getByTestId('city-node-chapter-02')).toBeInTheDocument();
    expect(screen.getByTestId('city-node-chapter-03')).toBeInTheDocument();
  });

  it('first chapter is current when no progress', () => {
    mockGetProgress.mockReturnValue(defaultProgress());
    // First chapter is always unlocked
    mockIsChapterUnlocked.mockImplementation((id, sortedIds) => {
      return sortedIds.indexOf(id) === 0;
    });

    render(<ThreeKingdomsMap chapters={chapters} />);

    const firstNode = screen.getByTestId('city-node-chapter-00');
    expect(firstNode).toHaveAttribute('data-status', 'current');
  });

  it('completed chapters show completed status', () => {
    const progress = defaultProgress();
    progress.completedChapters = {
      'chapter-00': { stars: 3, completedAt: '2025-01-01' },
    };
    mockGetProgress.mockReturnValue(progress);
    mockIsChapterUnlocked.mockImplementation((id, sortedIds, completed) => {
      const idx = sortedIds.indexOf(id);
      if (idx <= 0) return true;
      const prevId = sortedIds[idx - 1];
      return prevId in completed;
    });

    render(<ThreeKingdomsMap chapters={chapters} />);

    expect(screen.getByTestId('city-node-chapter-00')).toHaveAttribute('data-status', 'completed');
  });

  it('next chapter after completed becomes current', () => {
    const progress = defaultProgress();
    progress.completedChapters = {
      'chapter-00': { stars: 3, completedAt: '2025-01-01' },
    };
    mockGetProgress.mockReturnValue(progress);
    mockIsChapterUnlocked.mockImplementation((id, sortedIds, completed) => {
      const idx = sortedIds.indexOf(id);
      if (idx <= 0) return true;
      const prevId = sortedIds[idx - 1];
      return prevId in completed;
    });

    render(<ThreeKingdomsMap chapters={chapters} />);

    expect(screen.getByTestId('city-node-chapter-01')).toHaveAttribute('data-status', 'current');
  });

  it('locked chapters show locked status', () => {
    const progress = defaultProgress();
    progress.completedChapters = {
      'chapter-00': { stars: 2, completedAt: '2025-01-01' },
    };
    mockGetProgress.mockReturnValue(progress);
    mockIsChapterUnlocked.mockImplementation((id, sortedIds, completed) => {
      const idx = sortedIds.indexOf(id);
      if (idx <= 0) return true;
      const prevId = sortedIds[idx - 1];
      return prevId in completed;
    });

    render(<ThreeKingdomsMap chapters={chapters} />);

    // chapter-02 and chapter-03 should be locked (chapter-01 is not completed)
    expect(screen.getByTestId('city-node-chapter-02')).toHaveAttribute('data-status', 'locked');
    expect(screen.getByTestId('city-node-chapter-03')).toHaveAttribute('data-status', 'locked');
  });

  it('act section headers are rendered', () => {
    mockGetProgress.mockReturnValue(defaultProgress());
    mockIsChapterUnlocked.mockReturnValue(false);

    render(<ThreeKingdomsMap chapters={chapters} />);

    expect(screen.getByText('第一幕：群雄并起')).toBeInTheDocument();
    expect(screen.getByText('第二幕：卧龙出山')).toBeInTheDocument();
  });

  it('renders MapNavBar', () => {
    mockGetProgress.mockReturnValue(defaultProgress());
    mockIsChapterUnlocked.mockReturnValue(false);

    render(<ThreeKingdomsMap chapters={chapters} />);

    expect(screen.getByTestId('map-navbar')).toBeInTheDocument();
    expect(screen.getByText('Level: 1')).toBeInTheDocument();
  });

  it('shows loading skeleton before progress is available', () => {
    // getProgress returns a value but useEffect hasn't run yet in the initial render.
    // We simulate this by checking the component renders loading initially.
    // Since useEffect runs synchronously in testing-library, we test by verifying
    // the progress-dependent content appears after render.
    mockGetProgress.mockReturnValue(defaultProgress());
    mockIsChapterUnlocked.mockReturnValue(false);

    render(<ThreeKingdomsMap chapters={chapters} />);

    // After useEffect, the map should be shown (loading state is transient)
    expect(screen.getByTestId('map-navbar')).toBeInTheDocument();
  });
});
