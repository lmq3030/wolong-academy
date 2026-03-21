import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BattleClient } from '../[chapterId]/BattleClient';
import type { Chapter, Challenge, ChapterRewards } from '@/lib/levels/types';

// ---- Mocks ----

const pushMock = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: pushMock }),
}));

const nextPhaseMock = vi.fn();
const submitCodeMock = vi.fn();
const useHintMock = vi.fn();

vi.mock('@/lib/engine/useLevelEngine', () => ({
  useLevelEngine: vi.fn(),
}));

vi.mock('@/components/battle/BattleScene', () => ({
  BattleScene: (props: any) => (
    <div
      data-testid="battle-scene"
      data-phase={props.phase}
      data-qi={props.qiPercent}
      data-stars={props.stars}
      onClick={() => props.onNextPhase()}
    />
  ),
}));

vi.mock('@/lib/progress', () => ({
  saveChapterProgress: vi.fn(),
  addXP: vi.fn(),
  unlockGenerals: vi.fn(),
}));

// ---- Helpers ----

import { useLevelEngine } from '@/lib/engine/useLevelEngine';
import { saveChapterProgress, addXP, unlockGenerals } from '@/lib/progress';

const mockUseLevelEngine = vi.mocked(useLevelEngine);
const mockSaveChapterProgress = vi.mocked(saveChapterProgress);
const mockAddXP = vi.mocked(addXP);
const mockUnlockGenerals = vi.mocked(unlockGenerals);

const mockChallenge: Challenge = {
  id: 'ch01-c1',
  type: 'fill_blank',
  prompt: '使用 print() 输出',
  codeTemplate: 'print(___)',
  correctAnswer: 'print("hello")',
  testCases: [{ expectedOutput: 'hello', description: 'output' }],
  hints: ['hint1', 'hint2'],
  qiReward: 50,
};

const mockRewards: ChapterRewards = {
  xp: 150,
  unlockGenerals: ['guan-yu', 'zhang-fei'],
  unlockItems: ['sword'],
  quote: '三顾茅庐',
};

const mockChapter: Chapter = {
  id: 'chapter-00',
  act: 1,
  title: '桃园三结义',
  storyIntro: '东汉末年...',
  pythonConcept: 'print()',
  difficulty: 1,
  interactionMode: 'fill',
  challenges: [mockChallenge],
  battle: {
    playerGeneral: 'liu-bei',
    enemyGeneral: 'cao-cao',
    playerSkill: '双股剑法',
    bgScene: '/scenes/peach-garden.webp',
  },
  rewards: mockRewards,
};

function setupEngine(phaseOverride?: string) {
  const engineReturn = {
    state: {
      phase: phaseOverride ?? 'challenge',
      currentChallengeIndex: 0,
      qiPercent: 60,
      stars: 3,
      errorsUsed: 0,
      hintsUsed: 0,
      errorMessage: undefined,
      errorLine: undefined,
      currentHint: undefined,
    },
    currentChallenge: mockChallenge,
    submitCode: submitCodeMock,
    useHint: useHintMock,
    nextPhase: nextPhaseMock,
    pyodideReady: true,
    rewards: mockRewards,
  };
  mockUseLevelEngine.mockReturnValue(engineReturn);
  return engineReturn;
}

describe('BattleClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn().mockResolvedValue({ ok: true });
  });

  it('renders BattleScene with correct props from engine', () => {
    setupEngine('challenge');
    render(<BattleClient chapter={mockChapter} />);

    const scene = screen.getByTestId('battle-scene');
    expect(scene).toBeInTheDocument();
    expect(scene).toHaveAttribute('data-phase', 'challenge');
    expect(scene).toHaveAttribute('data-qi', '60');
    expect(scene).toHaveAttribute('data-stars', '3');
  });

  it('on non-rewards phase, handleNextPhase delegates to engine.nextPhase', () => {
    setupEngine('story_intro');
    render(<BattleClient chapter={mockChapter} />);

    fireEvent.click(screen.getByTestId('battle-scene'));

    expect(nextPhaseMock).toHaveBeenCalledTimes(1);
    expect(mockSaveChapterProgress).not.toHaveBeenCalled();
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('on rewards phase, handleNextPhase saves progress to localStorage before navigating', () => {
    setupEngine('rewards');
    render(<BattleClient chapter={mockChapter} />);

    fireEvent.click(screen.getByTestId('battle-scene'));

    expect(mockSaveChapterProgress).toHaveBeenCalledWith('chapter-00', 3);
    expect(mockAddXP).toHaveBeenCalledWith(150);
    expect(mockUnlockGenerals).toHaveBeenCalledWith(['guan-yu', 'zhang-fei']);
    expect(pushMock).toHaveBeenCalledWith('/map');
  });

  it('on rewards phase, does not call engine.nextPhase', () => {
    setupEngine('rewards');
    render(<BattleClient chapter={mockChapter} />);

    fireEvent.click(screen.getByTestId('battle-scene'));

    expect(nextPhaseMock).not.toHaveBeenCalled();
  });

  it('calls fetch /api/progress on rewards phase', () => {
    setupEngine('rewards');
    render(<BattleClient chapter={mockChapter} />);

    fireEvent.click(screen.getByTestId('battle-scene'));

    expect(global.fetch).toHaveBeenCalledWith('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chapterId: 'chapter-00',
        stars: 3,
        xpGained: 150,
        unlockedGenerals: ['guan-yu', 'zhang-fei'],
        unlockedItems: ['sword'],
      }),
    });
  });

  it('navigates to /map after saving on rewards phase', () => {
    setupEngine('rewards');
    render(<BattleClient chapter={mockChapter} />);

    fireEvent.click(screen.getByTestId('battle-scene'));

    // localStorage saves happen before navigation
    expect(mockSaveChapterProgress).toHaveBeenCalled();
    expect(mockAddXP).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/map');
  });

  it('does not call unlockGenerals when chapter has no unlockGenerals reward', () => {
    const chapterNoGenerals: Chapter = {
      ...mockChapter,
      rewards: { xp: 100 },
    };
    const engineReturn = setupEngine('rewards');
    // Override rewards to have no unlockGenerals
    engineReturn.rewards = { xp: 100 };
    mockUseLevelEngine.mockReturnValue(engineReturn);

    render(<BattleClient chapter={chapterNoGenerals} />);
    fireEvent.click(screen.getByTestId('battle-scene'));

    expect(mockUnlockGenerals).not.toHaveBeenCalled();
    expect(mockSaveChapterProgress).toHaveBeenCalled();
    expect(mockAddXP).toHaveBeenCalled();
    expect(pushMock).toHaveBeenCalledWith('/map');
  });
});
