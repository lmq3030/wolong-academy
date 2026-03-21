import { chapter00 } from './chapter-00';
import { chapter01 } from './chapter-01';
import type { Chapter } from '../types';

export const chapters: Record<string, Chapter> = {
  'chapter-00': chapter00,
  'chapter-01': chapter01,
};
