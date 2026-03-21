import { chapter00 } from './chapter-00';
import { chapter01 } from './chapter-01';
import { chapter02 } from './chapter-02';
import { chapter03 } from './chapter-03';
import { chapter04 } from './chapter-04';
import { chapter05 } from './chapter-05';
import type { Chapter } from '../types';

export const chapters: Record<string, Chapter> = {
  'chapter-00': chapter00,
  'chapter-01': chapter01,
  'chapter-02': chapter02,
  'chapter-03': chapter03,
  'chapter-04': chapter04,
  'chapter-05': chapter05,
};
