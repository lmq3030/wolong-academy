export type BattlePhase =
  | 'concept_intro'
  | 'story_intro'
  | 'challenge'
  | 'validating'
  | 'qi_charging'
  | 'error_feedback'
  | 'skill_ready'
  | 'skill_animation'
  | 'victory'
  | 'rewards';

export interface ValidationResult {
  correct: boolean;
  output: string;
  error?: string;
  lineNumber?: number;
}

export interface LevelState {
  phase: BattlePhase;
  currentChallengeIndex: number;
  qiPercent: number;
  stars: number;
  errorsUsed: number;
  hintsUsed: number;
  currentHint?: string;
  errorMessage?: string;
  errorLine?: number;
  lastCorrectCode?: string;
  lastCorrectOutput?: string;
}
