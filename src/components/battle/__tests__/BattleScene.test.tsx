import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BattleScene } from '../BattleScene';
import type { Chapter, Challenge, ChapterRewards } from '@/lib/levels/types';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, initial, animate, exit, transition, ...props }: any) => (
      <div {...props}>{children}</div>
    ),
    button: ({ children, initial, animate, exit, transition, whileHover, whileTap, layout, ...props }: any) => (
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
  useInView: () => true,
}));

// Mock child components to isolate BattleScene tests
vi.mock('../Battlefield', () => ({
  Battlefield: ({ battle, qiPercent, phase }: any) => (
    <div data-testid="battlefield" data-phase={phase} data-qi={qiPercent}>
      Battlefield
    </div>
  ),
}));

vi.mock('../StoryIntro', () => ({
  StoryIntro: ({ title, story, onContinue }: any) => (
    <div data-testid="story-intro">
      <span>{title}</span>
      <span>{story}</span>
      <button onClick={onContinue}>继续</button>
    </div>
  ),
}));

vi.mock('../ErrorFeedback', () => ({
  ErrorFeedback: ({ message, lineNumber, onDismiss }: any) => (
    <div data-testid="error-feedback">
      <span>{message}</span>
      {lineNumber !== undefined && <span>Line {lineNumber}</span>}
      <button onClick={onDismiss}>再试一次</button>
    </div>
  ),
}));

vi.mock('../SkillAnimation', () => ({
  SkillAnimation: ({ skillName, onComplete }: any) => (
    <div data-testid="skill-animation">
      <span>{skillName}</span>
      <button onClick={onComplete}>Complete</button>
    </div>
  ),
}));

vi.mock('../VictoryScreen', () => ({
  VictoryScreen: ({ rewards, stars, onContinue }: any) => (
    <div data-testid="victory-screen">
      <span>XP: {rewards.xp}</span>
      <span>Stars: {stars}</span>
      <button onClick={onContinue}>继续</button>
    </div>
  ),
}));

vi.mock('@/components/editor/CodeEditorSwitch', () => ({
  CodeEditorSwitch: ({ challenge, onSubmit, disabled, ...rest }: any) => (
    <div data-testid="code-editor" data-disabled={disabled} data-challenge-id={challenge.id}>
      <span>{challenge.prompt}</span>
    </div>
  ),
}));

const mockChallenge: Challenge = {
  id: 'test-challenge',
  type: 'fill_blank',
  prompt: '使用 print() 输出你的名字',
  codeTemplate: 'print(___)',
  correctAnswer: 'print("刘备")',
  testCases: [{ expectedOutput: '刘备', description: '输出名字' }],
  hints: ['试试 print()', '用双引号包裹', 'print("刘备")'],
  qiReward: 50,
};

const mockChapter: Chapter = {
  id: 'chapter-test',
  act: 1,
  title: '桃园三结义',
  storyIntro: '东汉末年，天下大乱...',
  pythonConcept: 'print() 基础输出',
  difficulty: 1,
  interactionMode: 'fill',
  challenges: [mockChallenge],
  battle: {
    playerGeneral: 'liu-bei',
    enemyGeneral: 'cao-cao',
    playerSkill: '双股剑法',
    bgScene: '/scenes/peach-garden.webp',
  },
  rewards: {
    xp: 100,
    unlockGenerals: ['guan-yu'],
    quote: '不求同年同月同日生，但求同年同月同日死',
  },
};

const mockRewards: ChapterRewards = {
  xp: 100,
  unlockGenerals: ['guan-yu'],
  quote: '不求同年同月同日生',
};

const defaultProps = {
  chapter: mockChapter,
  phase: 'challenge' as const,
  qiPercent: 50,
  currentChallenge: mockChallenge,
  onSubmitCode: vi.fn(),
  onNextPhase: vi.fn(),
  onUseHint: vi.fn(),
};

describe('BattleScene', () => {
  it('renders StoryIntro overlay when phase is story_intro', () => {
    render(<BattleScene {...defaultProps} phase="story_intro" />);
    expect(screen.getByTestId('story-intro')).toBeInTheDocument();
    expect(screen.getByText('桃园三结义')).toBeInTheDocument();
    expect(screen.getByText('东汉末年，天下大乱...')).toBeInTheDocument();
  });

  it('renders code editor area when phase is challenge', () => {
    render(<BattleScene {...defaultProps} phase="challenge" />);
    const editor = screen.getByTestId('code-editor');
    expect(editor).toBeInTheDocument();
    expect(editor).toHaveAttribute('data-disabled', 'false');
  });

  it('shows validating text when phase is validating', () => {
    render(<BattleScene {...defaultProps} phase="validating" />);
    expect(screen.getByText('验证中...')).toBeInTheDocument();
  });

  it('shows ErrorFeedback overlay when phase is error_feedback', () => {
    render(
      <BattleScene
        {...defaultProps}
        phase="error_feedback"
        errorMessage="变量未定义"
        errorLine={3}
      />
    );
    expect(screen.getByTestId('error-feedback')).toBeInTheDocument();
    expect(screen.getByText('变量未定义')).toBeInTheDocument();
    expect(screen.getByText('Line 3')).toBeInTheDocument();
  });

  it('shows SkillAnimation overlay when phase is skill_animation', () => {
    render(<BattleScene {...defaultProps} phase="skill_animation" />);
    expect(screen.getByTestId('skill-animation')).toBeInTheDocument();
    expect(screen.getByText('双股剑法')).toBeInTheDocument();
  });

  it('shows VictoryScreen when phase is victory', () => {
    render(
      <BattleScene {...defaultProps} phase="victory" rewards={mockRewards} stars={2} />
    );
    expect(screen.getByTestId('victory-screen')).toBeInTheDocument();
    expect(screen.getByText('XP: 100')).toBeInTheDocument();
    expect(screen.getByText('Stars: 2')).toBeInTheDocument();
  });

  it('shows VictoryScreen when phase is rewards', () => {
    render(
      <BattleScene {...defaultProps} phase="rewards" rewards={mockRewards} stars={3} />
    );
    expect(screen.getByTestId('victory-screen')).toBeInTheDocument();
  });

  it('passes correct props to Battlefield', () => {
    render(<BattleScene {...defaultProps} phase="challenge" qiPercent={75} />);
    const battlefield = screen.getByTestId('battlefield');
    expect(battlefield).toHaveAttribute('data-phase', 'challenge');
    expect(battlefield).toHaveAttribute('data-qi', '75');
  });

  it('disables editor when phase is not challenge', () => {
    render(<BattleScene {...defaultProps} phase="validating" />);
    const editor = screen.getByTestId('code-editor');
    expect(editor).toHaveAttribute('data-disabled', 'true');
  });

  it('hint button is visible during challenge phase', () => {
    render(<BattleScene {...defaultProps} phase="challenge" />);
    const hintButton = screen.getByTitle('锦囊妙计');
    expect(hintButton).toBeInTheDocument();
    expect(hintButton).toBeVisible();
  });

  it('hint button calls onUseHint when clicked', () => {
    const onUseHint = vi.fn();
    render(<BattleScene {...defaultProps} phase="challenge" onUseHint={onUseHint} />);
    screen.getByTitle('锦囊妙计').click();
    expect(onUseHint).toHaveBeenCalledTimes(1);
  });

  it('challenge prompt text is displayed', () => {
    render(<BattleScene {...defaultProps} phase="challenge" />);
    // Prompt appears both in the prompt bar and inside the mocked editor
    const elements = screen.getAllByText('使用 print() 输出你的名字');
    expect(elements.length).toBeGreaterThanOrEqual(1);
    // The first match should be the prompt bar <p> element
    expect(elements[0].tagName).toBe('P');
  });

  it('shows hint text when currentHint is provided', () => {
    render(
      <BattleScene
        {...defaultProps}
        phase="challenge"
        currentHint="试试用 print()"
      />
    );
    expect(screen.getByText(/锦囊：试试用 print\(\)/)).toBeInTheDocument();
  });

  it('does not show hint text when currentHint is not provided', () => {
    render(<BattleScene {...defaultProps} phase="challenge" />);
    expect(screen.queryByText(/锦囊：/)).not.toBeInTheDocument();
  });

  it('does not show ErrorFeedback when phase is error_feedback but errorMessage is missing', () => {
    render(<BattleScene {...defaultProps} phase="error_feedback" />);
    expect(screen.queryByTestId('error-feedback')).not.toBeInTheDocument();
  });

  it('does not show VictoryScreen when phase is victory but rewards is missing', () => {
    render(<BattleScene {...defaultProps} phase="victory" />);
    expect(screen.queryByTestId('victory-screen')).not.toBeInTheDocument();
  });

  it('re-mounts editor when challenge changes (key={challenge.id} isolation)', () => {
    const challenge1: Challenge = {
      ...mockChallenge,
      id: 'challenge-1',
      prompt: 'First challenge',
    };
    const challenge2: Challenge = {
      ...mockChallenge,
      id: 'challenge-2',
      prompt: 'Second challenge',
    };

    const { rerender } = render(
      <BattleScene {...defaultProps} currentChallenge={challenge1} phase="challenge" />
    );
    expect(screen.getByTestId('code-editor').getAttribute('data-challenge-id')).toBe('challenge-1');

    rerender(
      <BattleScene {...defaultProps} currentChallenge={challenge2} phase="challenge" />
    );
    expect(screen.getByTestId('code-editor').getAttribute('data-challenge-id')).toBe('challenge-2');
  });
});
