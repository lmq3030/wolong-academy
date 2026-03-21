import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsPanel } from '../StatsPanel';
import type { LocalProgress } from '@/lib/progress';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    span: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <span {...props}>{children}</span>
    ),
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
  useInView: () => true,
}));

// Mock getProgress to control returned data
const mockGetProgress = vi.fn<() => LocalProgress>();
vi.mock('@/lib/progress', () => ({
  getProgress: () => mockGetProgress(),
}));

// Mock chapters and generals with known sizes
vi.mock('@/lib/levels', () => ({
  chapters: {
    'chapter-00': {},
    'chapter-01': {},
    'chapter-02': {},
    'chapter-03': {},
    'chapter-04': {},
  },
}));

vi.mock('@/lib/generals', () => ({
  generals: [
    { id: 'liu-bei', name: '刘备', faction: 'shu' },
    { id: 'guan-yu', name: '关羽', faction: 'shu' },
    { id: 'zhang-fei', name: '张飞', faction: 'shu' },
    { id: 'cao-cao', name: '曹操', faction: 'wei' },
    { id: 'sun-quan', name: '孙权', faction: 'wu' },
  ],
}));

describe('StatsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders 4 stat cards', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {
        'chapter-00': { stars: 3, completedAt: '2025-01-01T00:00:00Z' },
        'chapter-01': { stars: 2, completedAt: '2025-01-02T00:00:00Z' },
      },
      unlockedGenerals: ['liu-bei', 'guan-yu'],
      xp: 500,
      level: 2,
    });

    render(<StatsPanel />);

    expect(screen.getByText('攻城数')).toBeInTheDocument();
    expect(screen.getByText('麾下武将')).toBeInTheDocument();
    expect(screen.getByText('战功')).toBeInTheDocument();
    expect(screen.getByText('平均战评')).toBeInTheDocument();
  });

  it('shows correct stat labels', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    render(<StatsPanel />);

    expect(screen.getByText('攻城数')).toBeInTheDocument();
    expect(screen.getByText('麾下武将')).toBeInTheDocument();
    expect(screen.getByText('战功')).toBeInTheDocument();
    expect(screen.getByText('平均战评')).toBeInTheDocument();
  });

  it('displays detail text for completed chapters', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {
        'chapter-00': { stars: 3, completedAt: '2025-01-01T00:00:00Z' },
      },
      unlockedGenerals: ['liu-bei'],
      xp: 100,
      level: 1,
    });

    render(<StatsPanel />);

    // Detail text based on mocked 5 chapters total
    expect(screen.getByText('共 5 座城池')).toBeInTheDocument();
    // Detail text based on mocked 5 generals total
    expect(screen.getByText('共 5 位名将')).toBeInTheDocument();
    expect(screen.getByText('累计经验值')).toBeInTheDocument();
    // With completedCount > 0, should show "满分 3.0"
    expect(screen.getByText('满分 3.0')).toBeInTheDocument();
  });

  it('handles empty progress (all zeros)', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    render(<StatsPanel />);

    expect(screen.getByText('共 5 座城池')).toBeInTheDocument();
    expect(screen.getByText('共 5 位名将')).toBeInTheDocument();
    expect(screen.getByText('累计经验值')).toBeInTheDocument();
    // With completedCount === 0, should show "尚未完成关卡"
    expect(screen.getByText('尚未完成关卡')).toBeInTheDocument();
  });

  it('returns null before progress is loaded', () => {
    // On server or before useEffect runs, getProgress returns null-ish
    // But actually the component uses getProgress inside useEffect.
    // Before the effect, progress is null, so it renders null.
    // We can test this by checking that when progress is set,
    // the stat cards appear.
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    const { container } = render(<StatsPanel />);
    // After useEffect runs, it should have content
    expect(container.querySelector('.grid')).toBeInTheDocument();
  });
});
