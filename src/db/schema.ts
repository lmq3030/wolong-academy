import { pgTable, text, timestamp, integer, jsonb } from 'drizzle-orm/pg-core';

/**
 * Simplified schema for 卧龙学堂.
 * One table stores everything — username-based login, progress as JSONB.
 */
export const gamePlayers = pgTable('game_player', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text('username').notNull().unique(),
  progressData: jsonb('progress_data').$type<{
    completedChapters: Record<string, { stars: number; completedAt: string }>;
    unlockedGenerals: string[];
    xp: number;
    level: number;
  }>().notNull().default({
    completedChapters: {},
    unlockedGenerals: [],
    xp: 0,
    level: 1,
  }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' }).defaultNow().notNull(),
});
