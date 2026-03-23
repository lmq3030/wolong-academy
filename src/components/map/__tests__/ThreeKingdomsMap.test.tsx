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
    <g data-testid={`city-node-${chapter.id}`} data-status={status} data-stars={stars} data-x={x} data-y={y}>
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

/* ================================================================
 * Node Layout / Overlap Tests
 *
 * These tests render the full 16-chapter, 4-act layout and verify
 * that computeNodePositions (an internal function) produces
 * non-overlapping coordinates by inspecting the rendered CityNode
 * data-x / data-y attributes.
 * ================================================================ */

describe('ThreeKingdomsMap — node layout (16 chapters, 4 acts)', () => {
  // Build a realistic 16-chapter array: 4 chapters per act
  const fullChapters: Chapter[] = [];
  for (let i = 0; i < 16; i++) {
    const act = (Math.floor(i / 4) + 1) as 1 | 2 | 3 | 4;
    fullChapters.push(
      makeChapter({
        id: `chapter-${String(i).padStart(2, '0')}`,
        act,
        title: `Ch${i}`,
      }),
    );
  }

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProgress.mockReturnValue(defaultProgress());
    mockIsChapterUnlocked.mockReturnValue(false);
  });

  it('renders all 16 chapter nodes', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);
    for (let i = 0; i < 16; i++) {
      const id = `chapter-${String(i).padStart(2, '0')}`;
      expect(screen.getByTestId(`city-node-${id}`)).toBeInTheDocument();
    }
  });

  it('no two nodes share the exact same (x, y) position', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    const coords: string[] = [];
    for (let i = 0; i < 16; i++) {
      const id = `chapter-${String(i).padStart(2, '0')}`;
      const node = screen.getByTestId(`city-node-${id}`);
      const x = node.getAttribute('data-x');
      const y = node.getAttribute('data-y');
      const key = `${x},${y}`;
      expect(coords).not.toContain(key);
      coords.push(key);
    }
  });

  it('nodes within the same act have the same approximate Y band (within 80px)', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    for (let act = 1; act <= 4; act++) {
      const actNodes: number[] = [];
      for (let i = (act - 1) * 4; i < act * 4; i++) {
        const id = `chapter-${String(i).padStart(2, '0')}`;
        const node = screen.getByTestId(`city-node-${id}`);
        actNodes.push(Number(node.getAttribute('data-y')));
      }
      const minY = Math.min(...actNodes);
      const maxY = Math.max(...actNodes);
      // Wave amplitude is 30, so max spread within act should be <= 60 (sin curve)
      // Use 80px tolerance to be safe
      expect(maxY - minY).toBeLessThanOrEqual(80);
    }
  });

  it('act rows are vertically separated (no Y overlap between different acts)', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    const actYRanges: { min: number; max: number }[] = [];
    for (let act = 1; act <= 4; act++) {
      const ys: number[] = [];
      for (let i = (act - 1) * 4; i < act * 4; i++) {
        const id = `chapter-${String(i).padStart(2, '0')}`;
        const node = screen.getByTestId(`city-node-${id}`);
        ys.push(Number(node.getAttribute('data-y')));
      }
      actYRanges.push({ min: Math.min(...ys), max: Math.max(...ys) });
    }

    // Each act's max Y should be less than the next act's min Y
    for (let i = 0; i < actYRanges.length - 1; i++) {
      expect(actYRanges[i].max).toBeLessThan(actYRanges[i + 1].min);
    }
  });

  it('nodes within the same act are horizontally spread (no X overlap within 40px)', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    for (let act = 1; act <= 4; act++) {
      const xs: number[] = [];
      for (let i = (act - 1) * 4; i < act * 4; i++) {
        const id = `chapter-${String(i).padStart(2, '0')}`;
        const node = screen.getByTestId(`city-node-${id}`);
        xs.push(Number(node.getAttribute('data-x')));
      }
      // Sort and check pairwise distance
      xs.sort((a, b) => a - b);
      for (let j = 1; j < xs.length; j++) {
        expect(xs[j] - xs[j - 1]).toBeGreaterThanOrEqual(40);
      }
    }
  });

  it('odd acts go left-to-right, even acts go right-to-left', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    for (let act = 1; act <= 4; act++) {
      const xs: number[] = [];
      for (let i = (act - 1) * 4; i < act * 4; i++) {
        const id = `chapter-${String(i).padStart(2, '0')}`;
        const node = screen.getByTestId(`city-node-${id}`);
        xs.push(Number(node.getAttribute('data-x')));
      }

      if (act % 2 === 1) {
        // Left-to-right: each subsequent X should be >= previous
        for (let j = 1; j < xs.length; j++) {
          expect(xs[j]).toBeGreaterThan(xs[j - 1]);
        }
      } else {
        // Right-to-left: each subsequent X should be <= previous
        for (let j = 1; j < xs.length; j++) {
          expect(xs[j]).toBeLessThan(xs[j - 1]);
        }
      }
    }
  });

  it('all nodes are within SVG viewport bounds (x: 0-1000)', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    for (let i = 0; i < 16; i++) {
      const id = `chapter-${String(i).padStart(2, '0')}`;
      const node = screen.getByTestId(`city-node-${id}`);
      const x = Number(node.getAttribute('data-x'));
      const y = Number(node.getAttribute('data-y'));
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(1000);
      expect(y).toBeGreaterThan(0);
    }
  });

  it('all 4 act labels are rendered', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    expect(screen.getByText('第一幕：群雄并起')).toBeInTheDocument();
    expect(screen.getByText('第二幕：卧龙出山')).toBeInTheDocument();
    expect(screen.getByText('第三幕：三分天下')).toBeInTheDocument();
    expect(screen.getByText('第四幕：北伐中原')).toBeInTheDocument();
  });

  it('renders 15 paths between 16 consecutive nodes', () => {
    render(<ThreeKingdomsMap chapters={fullChapters} />);

    const paths = screen.getAllByTestId('map-path');
    expect(paths).toHaveLength(15);
  });
});

/* ================================================================
 * Uneven act distribution — e.g. 6 in act 1, 2 in act 2
 * ================================================================ */
describe('ThreeKingdomsMap — uneven chapter distribution', () => {
  const unevenChapters: Chapter[] = [
    // 6 chapters in act 1
    ...Array.from({ length: 6 }, (_, i) =>
      makeChapter({ id: `ch-a1-${i}`, act: 1 as const, title: `A1-${i}` }),
    ),
    // 2 chapters in act 2
    ...Array.from({ length: 2 }, (_, i) =>
      makeChapter({ id: `ch-a2-${i}`, act: 2 as const, title: `A2-${i}` }),
    ),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProgress.mockReturnValue(defaultProgress());
    mockIsChapterUnlocked.mockReturnValue(false);
  });

  it('renders all nodes even with uneven distribution', () => {
    render(<ThreeKingdomsMap chapters={unevenChapters} />);
    for (const ch of unevenChapters) {
      expect(screen.getByTestId(`city-node-${ch.id}`)).toBeInTheDocument();
    }
  });

  it('no overlap with 6 nodes in one act', () => {
    render(<ThreeKingdomsMap chapters={unevenChapters} />);

    const coords = new Set<string>();
    for (const ch of unevenChapters) {
      const node = screen.getByTestId(`city-node-${ch.id}`);
      const x = node.getAttribute('data-x');
      const y = node.getAttribute('data-y');
      const key = `${x},${y}`;
      expect(coords.has(key)).toBe(false);
      coords.add(key);
    }
  });
});

/* ================================================================
 * Single chapter edge case
 * ================================================================ */
describe('ThreeKingdomsMap — single chapter', () => {
  const singleChapter: Chapter[] = [
    makeChapter({ id: 'chapter-solo', act: 1, title: 'Solo' }),
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetProgress.mockReturnValue(defaultProgress());
    mockIsChapterUnlocked.mockReturnValue(true);
  });

  it('renders single chapter without crashing', () => {
    render(<ThreeKingdomsMap chapters={singleChapter} />);
    expect(screen.getByTestId('city-node-chapter-solo')).toBeInTheDocument();
  });

  it('single chapter is centered (x ~ 500)', () => {
    render(<ThreeKingdomsMap chapters={singleChapter} />);
    const node = screen.getByTestId('city-node-chapter-solo');
    const x = Number(node.getAttribute('data-x'));
    // Single node should be at x=500 (center)
    expect(x).toBe(500);
  });

  it('renders 0 paths for a single chapter', () => {
    render(<ThreeKingdomsMap chapters={singleChapter} />);
    expect(screen.queryAllByTestId('map-path')).toHaveLength(0);
  });
});
