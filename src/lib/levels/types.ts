export interface TestCase {
  input?: string;           // stdin input (if needed)
  expectedOutput: string;   // expected stdout
  description: string;      // what this test checks
}

export interface DragOption {
  id: string;
  code: string;             // the code text on the draggable block
  isCorrect: boolean;
  slot?: number;            // which drop zone (0-indexed)
}

export interface Challenge {
  id: string;
  type: 'drag' | 'fill_blank' | 'multiple_choice' | 'free_code';
  prompt: string;                    // the challenge description (Three Kingdoms flavored)
  codeTemplate?: string;             // code with ___ blanks (for fill_blank)
  correctAnswer: string;             // the correct complete code
  testCases: TestCase[];
  hints: string[];                   // 3 levels of hints (gentle → direct → near-answer)
  qiReward: number;                  // qi gauge charge % (all challenges should sum to 100)
  dragOptions?: DragOption[];        // for drag type
  choices?: string[];                // for multiple_choice type
}

export interface BattleConfig {
  playerGeneral: string;     // general id
  enemyGeneral?: string;     // general id (optional for tutorial)
  playerSkill: string;       // skill name to display
  bgScene: string;           // background image path
}

export interface ChapterRewards {
  xp: number;
  unlockGenerals?: string[];   // general ids to unlock
  unlockItems?: string[];      // item ids to unlock
  quote?: string;              // Three Kingdoms quote easter egg
}

export interface Chapter {
  id: string;
  act: 1 | 2 | 3 | 4;
  title: string;                    // "桃园三结义"
  storyIntro: string;               // narrative text shown before challenges
  pythonConcept: string;            // "print() 基础输出"
  difficulty: 1 | 2 | 3 | 4 | 5;
  interactionMode: 'drag' | 'fill' | 'code' | 'mixed';
  challenges: Challenge[];
  battle: BattleConfig;
  rewards: ChapterRewards;
}
