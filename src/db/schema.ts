import {
  pgTable,
  text,
  timestamp,
  integer,
  primaryKey,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/core/adapters";

// ============================================================================
// NextAuth Adapter Tables
// These match the exact schema expected by @auth/drizzle-adapter for PostgreSQL.
// Table names: "user", "account", "session", "verificationToken", "authenticator"
// ============================================================================

export const users = pgTable("user", {
  // Standard NextAuth fields
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // Game-specific fields
  level: integer("level").default(1).notNull(),
  xp: integer("xp").default(0).notNull(),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
});

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compositePk: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

// ============================================================================
// Game Tables
// ============================================================================

// --- Generals (武将) ---
export const generals = pgTable("general", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  faction: text("faction").$type<"shu" | "wei" | "wu" | "other">().notNull(),
  traits: text("traits"),
  skillName: text("skillName"),
  imageUrl: text("imageUrl"),
});

// --- User Generals (unlocked generals per user) ---
export const userGenerals = pgTable(
  "user_general",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    generalId: text("generalId")
      .notNull()
      .references(() => generals.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlockedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (ug) => ({
    pk: primaryKey({ columns: [ug.userId, ug.generalId] }),
  })
);

// --- Chapters (关卡) ---
export const chapters = pgTable("chapter", {
  id: text("id").primaryKey(),
  act: integer("act").notNull(), // 1-4
  title: text("title").notNull(),
  storyArc: text("storyArc"),
  pythonConcept: text("pythonConcept"),
  difficulty: integer("difficulty").notNull(), // 1-5
});

// --- User Progress (per-chapter progress) ---
export const userProgress = pgTable(
  "user_progress",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    chapterId: text("chapterId")
      .notNull()
      .references(() => chapters.id, { onDelete: "cascade" }),
    stars: integer("stars").notNull(), // 1-3
    bestCode: text("bestCode"),
    completedAt: timestamp("completedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (up) => ({
    pk: primaryKey({ columns: [up.userId, up.chapterId] }),
  })
);

// --- Items (道具) ---
export const items = pgTable("item", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type")
    .$type<"weapon" | "mount" | "book" | "pouch">()
    .notNull(),
  effect: text("effect"),
  imageUrl: text("imageUrl"),
});

// --- User Items (inventory) ---
export const userItems = pgTable(
  "user_item",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    itemId: text("itemId")
      .notNull()
      .references(() => items.id, { onDelete: "cascade" }),
    equippedToGeneralId: text("equippedToGeneralId").references(
      () => generals.id,
      { onDelete: "set null" }
    ),
  },
  (ui) => ({
    pk: primaryKey({ columns: [ui.userId, ui.itemId] }),
  })
);

// --- Achievements (成就) ---
export const achievements = pgTable("achievement", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  triggerCondition: text("triggerCondition"),
});

// --- User Achievements (unlocked achievements) ---
export const userAchievements = pgTable(
  "user_achievement",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    achievementId: text("achievementId")
      .notNull()
      .references(() => achievements.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlockedAt", { mode: "date" }).defaultNow().notNull(),
  },
  (ua) => ({
    pk: primaryKey({ columns: [ua.userId, ua.achievementId] }),
  })
);

// ============================================================================
// Relations
// ============================================================================

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  userGenerals: many(userGenerals),
  userProgress: many(userProgress),
  userItems: many(userItems),
  userAchievements: many(userAchievements),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const authenticatorsRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));

export const generalsRelations = relations(generals, ({ many }) => ({
  userGenerals: many(userGenerals),
  equippedItems: many(userItems),
}));

export const userGeneralsRelations = relations(userGenerals, ({ one }) => ({
  user: one(users, { fields: [userGenerals.userId], references: [users.id] }),
  general: one(generals, {
    fields: [userGenerals.generalId],
    references: [generals.id],
  }),
}));

export const chaptersRelations = relations(chapters, ({ many }) => ({
  userProgress: many(userProgress),
}));

export const userProgressRelations = relations(userProgress, ({ one }) => ({
  user: one(users, {
    fields: [userProgress.userId],
    references: [users.id],
  }),
  chapter: one(chapters, {
    fields: [userProgress.chapterId],
    references: [chapters.id],
  }),
}));

export const itemsRelations = relations(items, ({ many }) => ({
  userItems: many(userItems),
}));

export const userItemsRelations = relations(userItems, ({ one }) => ({
  user: one(users, { fields: [userItems.userId], references: [users.id] }),
  item: one(items, { fields: [userItems.itemId], references: [items.id] }),
  equippedToGeneral: one(generals, {
    fields: [userItems.equippedToGeneralId],
    references: [generals.id],
  }),
}));

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));

export const userAchievementsRelations = relations(
  userAchievements,
  ({ one }) => ({
    user: one(users, {
      fields: [userAchievements.userId],
      references: [users.id],
    }),
    achievement: one(achievements, {
      fields: [userAchievements.achievementId],
      references: [achievements.id],
    }),
  })
);
