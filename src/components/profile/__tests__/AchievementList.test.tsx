import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AchievementList } from '../AchievementList';
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
}));

// Mock getProgress to control returned data
const mockGetProgress = vi.fn<() => LocalProgress>();
vi.mock('@/lib/progress', () => ({
  getProgress: () => mockGetProgress(),
}));

// Mock chapters with controlled data
vi.mock('@/lib/levels', () => ({
  chapters: {
    'chapter-00': { act: 1, title: '桃园三结义' },
    'chapter-01': { act: 1, title: '初入江湖' },
    'chapter-02': { act: 1, title: '群英荟萃' },
    'chapter-03': { act: 1, title: '赤壁前夜' },
    'chapter-04': { act: 1, title: '火烧博望' },
    'chapter-05': { act: 1, title: '长坂坡', pythonConcept: 'for循环' },
  },
}));

// Mock generals to control shu faction count
vi.mock('@/lib/generals', () => ({
  generals: [
    { id: 'liu-bei', name: '刘备', faction: 'shu' },
    { id: 'guan-yu', name: '关羽', faction: 'shu' },
    { id: 'zhang-fei', name: '张飞', faction: 'shu' },
    { id: 'zhuge-liang', name: '诸葛亮', faction: 'shu' },
    { id: 'zhao-yun', name: '赵云', faction: 'shu' },
    { id: 'cao-cao', name: '曹操', faction: 'wei' },
  ],
}));

describe('AchievementList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all achievements', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    render(<AchievementList />);

    // There are 8 achievements defined in the component
    expect(screen.getByText('桃园之誓')).toBeInTheDocument();
    expect(screen.getByText('初出茅庐')).toBeInTheDocument();
    expect(screen.getByText('赤壁大捷')).toBeInTheDocument();
    expect(screen.getByText('五虎上将')).toBeInTheDocument();
    expect(screen.getByText('天下三分')).toBeInTheDocument();
    expect(screen.getByText('十全十美')).toBeInTheDocument();
    expect(screen.getByText('武将收藏家')).toBeInTheDocument();
    expect(screen.getByText('博学多才')).toBeInTheDocument();
  });

  it('unlocked achievements show name and description', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {
        'chapter-00': { stars: 3, completedAt: '2025-01-01T00:00:00Z' },
      },
      unlockedGenerals: [],
      xp: 100,
      level: 1,
    });

    render(<AchievementList />);

    // '桃园之誓' should be unlocked (chapter-00 completed)
    expect(screen.getByText('桃园之誓')).toBeInTheDocument();
    expect(screen.getByText('完成第一关')).toBeInTheDocument();
  });

  it('locked achievements show name but "???" for description', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    render(<AchievementList />);

    // All achievements are locked, so descriptions should be "???"
    const questionMarks = screen.getAllByText('???');
    expect(questionMarks.length).toBe(8); // all 8 achievements locked
  });

  it('shows progress counter (X/N)', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {
        'chapter-00': { stars: 3, completedAt: '2025-01-01T00:00:00Z' },
      },
      unlockedGenerals: [],
      xp: 100,
      level: 1,
    });

    render(<AchievementList />);

    // 1 achievement unlocked (桃园之誓), total 8
    expect(screen.getByText('已达成 1/8')).toBeInTheDocument();
  });

  it('shows 0 unlocked when no chapters completed', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    render(<AchievementList />);

    expect(screen.getByText('已达成 0/8')).toBeInTheDocument();
  });

  it('unlocks 桃园之誓 when chapter-00 is completed', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {
        'chapter-00': { stars: 2, completedAt: '2025-01-01T00:00:00Z' },
      },
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    render(<AchievementList />);

    expect(screen.getByText('完成第一关')).toBeInTheDocument();
    expect(screen.getByText('已达成 1/8')).toBeInTheDocument();
  });

  it('unlocks 初出茅庐 when all act 1 chapters are completed', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {
        'chapter-00': { stars: 3, completedAt: '2025-01-01T00:00:00Z' },
        'chapter-01': { stars: 3, completedAt: '2025-01-02T00:00:00Z' },
        'chapter-02': { stars: 2, completedAt: '2025-01-03T00:00:00Z' },
        'chapter-03': { stars: 2, completedAt: '2025-01-04T00:00:00Z' },
        'chapter-04': { stars: 3, completedAt: '2025-01-05T00:00:00Z' },
        'chapter-05': { stars: 3, completedAt: '2025-01-06T00:00:00Z' },
      },
      unlockedGenerals: [],
      xp: 600,
      level: 3,
    });

    render(<AchievementList />);

    // 初出茅庐 should be unlocked, showing its real description
    expect(screen.getByText('完成第一卷所有关卡')).toBeInTheDocument();
  });

  it('unlocks 五虎上将 when all shu generals are collected', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: ['liu-bei', 'guan-yu', 'zhang-fei', 'zhuge-liang', 'zhao-yun'],
      xp: 0,
      level: 1,
    });

    render(<AchievementList />);

    expect(screen.getByText('收集所有蜀汉武将')).toBeInTheDocument();
  });

  it('renders header with "成就" title', () => {
    mockGetProgress.mockReturnValue({
      completedChapters: {},
      unlockedGenerals: [],
      xp: 0,
      level: 1,
    });

    render(<AchievementList />);

    expect(screen.getByText('成就')).toBeInTheDocument();
  });
});
