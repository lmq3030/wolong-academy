import type { Challenge } from '@/lib/levels/types';

export interface EditorProps {
  challenge: Challenge;
  onSubmit: (code: string) => void;
  onPartialProgress?: (progress: number) => void;
  disabled?: boolean;
}
