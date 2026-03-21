# 卧龙学堂 (Sleeping Dragon Academy) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a browser-based Python learning game for kids (age 8-9) themed around Three Kingdoms with 三国群英传2-style battle mechanics.

**Architecture:** Next.js 15 App Router frontend with Pyodide (WebAssembly) running Python in a Web Worker. Vercel Postgres for persistence, NextAuth.js for Google login. Levels are JSON-driven. The core loop: code challenges charge a qi gauge → full gauge triggers 武将技 battle animations.

**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, Framer Motion, Pyodide, NextAuth.js, Vercel Postgres (Drizzle ORM), Vercel Blob, Nano Banana Pro (image generation)

**Design Doc:** `docs/plans/2026-03-21-python-learning-game-design.md`

---

## Phase 1: Foundation

### Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`, `.env.local.example`, `.gitignore`

**Step 1: Initialize Next.js project**

Note: The repo already has `docs/` and research markdown files. Move them aside, scaffold, then restore:
```bash
mkdir /tmp/pgame-backup && mv docs three-kingdoms-research.md sango-heroes-2-mechanics.md /tmp/pgame-backup/
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm
mv /tmp/pgame-backup/* . && rm -rf /tmp/pgame-backup
```

Expected: Project scaffolded with `src/app/` structure, existing docs preserved.

**Step 2: Install core dependencies**

```bash
npm install framer-motion drizzle-orm @vercel/postgres next-auth@beta @auth/drizzle-adapter drizzle-zod zod
npm install -D drizzle-kit @types/node
```

**Step 3: Create `.env.local.example`**

```env
# Database
POSTGRES_URL=
POSTGRES_PRISMA_URL=
POSTGRES_URL_NON_POOLING=

# Auth
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# Vercel Blob
BLOB_READ_WRITE_TOKEN=
```

**Step 4: Update `src/app/globals.css` with base theme**

Light theme with warm Three Kingdoms color palette. Define CSS variables:
```css
:root {
  --color-shu-red: #C41E3A;
  --color-wei-blue: #1B4D8E;
  --color-wu-green: #2D6A4F;
  --color-gold: #D4A843;
  --color-parchment: #F5F0E8;
  --color-ink: #2C1810;
}
```

**Step 5: Replace `src/app/page.tsx` with placeholder landing**

Simple page with game title "卧龙学堂" and "开始游戏" button. Light parchment background.

**Step 6: Verify dev server runs**

```bash
npm run dev
```

Expected: App loads at `http://localhost:3000` with landing page.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: scaffold Next.js project with core deps [ai:y]"
```

---

### Task 2: Pyodide Web Worker Integration

**Files:**
- Create: `public/pyodide-worker.js`
- Create: `src/lib/pyodide/usePyodide.ts`
- Create: `src/lib/pyodide/types.ts`
- Test: `src/lib/pyodide/__tests__/pyodide-integration.test.tsx`

**Step 1: Install test dependencies**

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom @vitejs/plugin-react
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test-setup.ts',
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

Create `src/test-setup.ts`:
```typescript
import '@testing-library/jest-dom'
```

**Step 2: Define types**

Create `src/lib/pyodide/types.ts`:
```typescript
export interface PyodideMessage {
  id: string;
  type: 'run';
  code: string;
  timeout?: number;
}

export interface PyodideResult {
  id: string;
  success: boolean;
  output: string;
  error?: string;
  duration: number;
}
```

**Step 3: Create Web Worker**

Create `public/pyodide-worker.js` that:
- Loads Pyodide from CDN (`https://cdn.jsdelivr.net/pyodide/v0.26.4/full/`)
- Listens for `{ type: 'run', code, id }` messages
- Captures stdout/stderr via `pyodide.setStdout` / `pyodide.setStderr`
- Returns `{ id, success, output, error, duration }`
- Implements 5-second timeout via `setTimeout` + `pyodide.interrupt_buffer`

**Step 4: Create React hook**

Create `src/lib/pyodide/usePyodide.ts`:
```typescript
export function usePyodide() {
  // State: loading, ready, error
  // Creates worker on mount, terminates on unmount
  // Exposes: runCode(code: string) => Promise<PyodideResult>
  // Handles timeout (5s default)
  // Returns { isReady, isLoading, runCode, error }
}
```

**Step 5: Write integration test**

Test that `usePyodide` can:
- Initialize (mock Worker for unit test)
- Run `print("hello")` → output: `"hello\n"`
- Handle syntax errors gracefully
- Handle timeout on infinite loops

**Step 6: Run tests**

```bash
npx vitest run src/lib/pyodide
```

Expected: All tests pass.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add Pyodide Web Worker integration with usePyodide hook [ai:y]"
```

---

### Task 3: Database Schema & Drizzle ORM

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/index.ts`
- Create: `src/db/seed.ts`
- Create: `drizzle.config.ts`

**Step 1: Define schema**

Create `src/db/schema.ts` with Drizzle schema for all 6 tables from design:
- `users` — id (uuid), name, email, emailVerified, image (required by NextAuth adapter), plus game fields: avatar, level (default 1), xp (default 0), createdAt
- `generals` — id, name, faction (enum: shu/wei/wu/other), traits, skillName, imageUrl
- `userGenerals` — userId, generalId, unlockedAt (composite PK)
- `chapters` — id, act (1-4), title, storyArc, pythonConcept, difficulty (1-5)
- `userProgress` — userId, chapterId, stars (1-3), bestCode (text), completedAt
- `items` — id, name, type (enum: weapon/mount/book/pouch), effect, imageUrl
- `userItems` — userId, itemId, equippedToGeneralId (nullable)
- `achievements` — id, name, description, triggerCondition
- `userAchievements` — userId, achievementId, unlockedAt

Also create the `accounts` and `sessions` tables required by NextAuth Drizzle adapter.

**Step 2: Create DB connection**

Create `src/db/index.ts`:
```typescript
import { drizzle } from 'drizzle-orm/vercel-postgres'
import { sql } from '@vercel/postgres'
import * as schema from './schema'

export const db = drizzle(sql, { schema })
```

**Step 3: Create Drizzle config**

Create `drizzle.config.ts`:
```typescript
import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,
  },
})
```

**Step 4: Create seed script**

Create `src/db/seed.ts` that seeds:
- All ~20 generals with accurate Three Kingdoms data (name, faction, traits, skillName)
- All 16+4 chapters with metadata
- All items (兵书, 坐骑, 武器, 锦囊 from the design)
- Achievements (first print, first loop, beat boss, collect all Shu generals, etc.)

Reference: `three-kingdoms-research.md` for character data accuracy.

**Step 5: Generate migration**

```bash
npx drizzle-kit generate
```

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add database schema, Drizzle ORM config, and seed data [ai:y]"
```

---

### Task 4: Authentication (NextAuth.js + Google)

**Files:**
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/lib/auth.ts`
- Create: `src/app/login/page.tsx`
- Create: `src/components/auth/LoginButton.tsx`
- Create: `src/components/auth/UserAvatar.tsx`
- Modify: `src/app/layout.tsx` — wrap with SessionProvider

**Step 1: Configure NextAuth**

Create `src/lib/auth.ts`:
```typescript
import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { DrizzleAdapter } from '@auth/drizzle-adapter'
import { db } from '@/db'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db),
  providers: [Google],
  pages: { signIn: '/login' },
})
```

Create route handler at `src/app/api/auth/[...nextauth]/route.ts`.

**Step 2: Create login page**

Three Kingdoms themed login page with:
- Game title "卧龙学堂"
- Google login button styled as a scroll/bamboo slip (竹简)
- Parchment background
- Tagline: "成为诸葛亮的弟子，用Python征服三国！"

**Step 3: Create LoginButton and UserAvatar components**

Simple components using next-auth's `useSession`.

**Step 4: Wrap layout with SessionProvider**

Update `src/app/layout.tsx` to include `SessionProvider`.

**Step 5: Test login flow manually**

```bash
npm run dev
```

Navigate to `/login`, verify Google OAuth flow works (requires `.env.local` configured).

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add NextAuth.js Google login with Three Kingdoms themed login page [ai:y]"
```

---

## Phase 2: Core Game Engine

### Task 5: Level Data System (JSON-driven)

**Files:**
- Create: `src/lib/levels/types.ts`
- Create: `src/lib/levels/chapters/chapter-00.ts` (桃园三结义)
- Create: `src/lib/levels/chapters/chapter-01.ts` (温酒斩华雄)
- Create: `src/lib/levels/index.ts`
- Create: `src/lib/levels/validation.ts`
- Test: `src/lib/levels/__tests__/levels.test.ts`

**Step 1: Define level types**

Create `src/lib/levels/types.ts` with the `Chapter` and `Challenge` interfaces from the design doc, plus:
```typescript
export interface TestCase {
  input?: string;
  expectedOutput: string;
  description: string;
}

export interface DragOption {
  id: string;
  code: string;
  isCorrect: boolean;
  slot?: number;  // which slot this belongs to
}
```

**Step 2: Write Level 0 (桃园三结义 — Tutorial)**

Create `src/lib/levels/chapters/chapter-00.ts`:
- 3 challenges, all drag-and-drop
- Challenge 1: Drag `print("桃园三结义")` to correct position → teaches print
- Challenge 2: Drag `name = "刘备"` then `print(name)` → teaches variables
- Challenge 3: Drag three print statements in order (刘备→关羽→张飞) → teaches sequence
- Battle: Tutorial scene in peach garden. Player general: 刘备. No enemy.
- Rewards: XP 100, unlock 刘备+关羽+张飞, quote: "不求同年同月同日生，但求同年同月同日死"

**Step 3: Write Level 1 (温酒斩华雄 — Variables)**

Create `src/lib/levels/chapters/chapter-01.ts`:
- 3 challenges: drag + fill-blank
- Challenge 1: Drag `weapon = "青龙偃月刀"` → variable assignment
- Challenge 2: Fill blank: `hero = "___"` (choices: 关羽/华雄/张飞) → string variable
- Challenge 3: Fill blank: `print(hero + "斩了" + ___)` → string concatenation
- Battle: 关羽 vs 华雄, skill: 落日弓
- Rewards: XP 150

**Step 4: Create level index and validation**

`src/lib/levels/index.ts` — exports all chapters as a map by id.
`src/lib/levels/validation.ts` — Zod schema to validate chapter JSON at build time.

**Step 5: Write tests**

Test that:
- All chapters pass Zod validation
- Each chapter has at least 1 challenge
- qi rewards sum to >= 100 (enough to fill gauge)
- All referenced generals/items exist in seed data

**Step 6: Run tests**

```bash
npx vitest run src/lib/levels
```

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add JSON-driven level system with first 2 chapters [ai:y]"
```

---

### Task 6: Code Editor Components

**Files:**
- Create: `src/components/editor/DragDropEditor.tsx`
- Create: `src/components/editor/FillBlankEditor.tsx`
- Create: `src/components/editor/FreeCodeEditor.tsx`
- Create: `src/components/editor/CodeEditorSwitch.tsx`
- Create: `src/components/editor/types.ts`
- Test: `src/components/editor/__tests__/DragDropEditor.test.tsx`

**Step 1: Define editor component props**

Create `src/components/editor/types.ts`:
```typescript
export interface EditorProps {
  challenge: Challenge;
  onSubmit: (code: string) => void;
  onPartialCorrect?: (progress: number) => void;
  disabled?: boolean;
}
```

**Step 2: Build DragDropEditor**

- Displays code blocks as draggable pills (styled as 竹简 bamboo slips)
- Drop zones are highlighted slots in a code frame
- Uses HTML Drag and Drop API (not a library — keep it simple)
- Correct placement triggers a satisfying "snap" animation (Framer Motion spring)
- Wrong placement shakes the block and returns it
- When all slots filled correctly → calls `onSubmit` with assembled code string

**Step 3: Build FillBlankEditor**

- Renders code with `___` blanks replaced by input fields or dropdown selects
- Input fields have large text, kid-friendly (min 44px touch target)
- Dropdown for multiple-choice blanks
- Tab between blanks
- Submit button styled as a red military seal (军令状)

**Step 4: Build FreeCodeEditor**

- Simple `<textarea>` with monospace font, syntax highlighting via regex (basic: keywords in blue, strings in green, comments in gray)
- Line numbers on the left
- Large font (18px+)
- "运行" (Run) button styled as a battle horn (号角)
- Auto-indent on Enter
- NO external code editor library (CodeMirror etc.) — keep bundle small for kids

**Step 5: Build CodeEditorSwitch**

Wrapper that picks the right editor based on `challenge.type`:
```typescript
export function CodeEditorSwitch({ challenge, onSubmit }: EditorProps) {
  switch (challenge.type) {
    case 'drag': return <DragDropEditor ... />
    case 'fill_blank': return <FillBlankEditor ... />
    case 'free_code': return <FreeCodeEditor ... />
    case 'multiple_choice': return <FillBlankEditor ... />  // reuse with dropdown mode
  }
}
```

**Step 6: Write test for DragDropEditor**

Test drag-drop flow:
- Render with 3 blocks and 3 slots
- Simulate drag block to correct slot → snaps in
- Simulate drag block to wrong slot → returns
- All correct → onSubmit called with assembled code

**Step 7: Run tests and commit**

```bash
npx vitest run src/components/editor && git add -A && git commit -m "feat: add code editor components (drag, fill, free) [ai:y]"
```

---

### Task 7: Battle Scene UI

**Files:**
- Create: `src/components/battle/BattleScene.tsx`
- Create: `src/components/battle/Battlefield.tsx`
- Create: `src/components/battle/QiGauge.tsx`
- Create: `src/components/battle/GeneralSprite.tsx`
- Create: `src/components/battle/SoldierGroup.tsx`
- Create: `src/components/battle/SkillAnimation.tsx`
- Create: `src/components/battle/ErrorFeedback.tsx`
- Create: `src/components/battle/StoryIntro.tsx`

**Step 1: Build BattleScene (orchestrator)**

`BattleScene.tsx` — the main component for `/battle/[chapterId]`:
- Layout: top 50% = Battlefield, bottom 50% = CodeEditorSwitch
- Manages state: current challenge index, qi gauge %, battle phase
- Flow:
  1. StoryIntro overlay (narrative text with "continue" button)
  2. Challenge appears in code area
  3. Each correct answer → qi gauge charges → troops advance
  4. All challenges done → qi full → SkillAnimation plays
  5. Victory screen with rewards

**Step 2: Build Battlefield**

`Battlefield.tsx` — the horizontal 2D battle view:
- Canvas: 100% width, ~350px height
- Background: level's `bgScene` image
- Left side: player GeneralSprite + SoldierGroup
- Right side: enemy GeneralSprite + SoldierGroup
- Soldiers advance/retreat based on qi gauge %
- Uses Framer Motion for smooth position interpolation

**Step 3: Build QiGauge**

`QiGauge.tsx`:
- Vertical bar on the left edge of the battlefield (致敬三国群英传2)
- Fills from bottom to top with animated gradient (red → gold)
- Percentage label
- Pulses when full (ready to release skill)
- Framer Motion `animate` on value change

**Step 4: Build GeneralSprite and SoldierGroup**

`GeneralSprite.tsx`:
- Displays general's card image (cropped to sprite)
- Idle animation: gentle bob up/down
- Attack animation: lunge forward
- Hit animation: flash red, shake
- Victory animation: raise weapon

`SoldierGroup.tsx`:
- Renders N small soldier icons in formation
- Count decreases as enemy "soldiers" are defeated
- Formation shape based on current battle state

**Step 5: Build SkillAnimation**

`SkillAnimation.tsx`:
- Full-screen overlay that plays when qi gauge hits 100%
- Different animation per skill (props: `skillName`)
- Phase 1: Screen flash white (100ms)
- Phase 2: Skill name appears in calligraphy (e.g., "落日弓")
- Phase 3: Visual effect (arrows flying / fire dragon / lightning)
- Phase 4: Enemy general hit, soldiers scatter
- All via Framer Motion `AnimatePresence` + `motion.div`
- Duration: ~3 seconds total

**Step 6: Build ErrorFeedback**

`ErrorFeedback.tsx`:
- Speech bubble from the military advisor (诸葛亮 or current advisor)
- Three Kingdoms styled error messages
- Highlights the error line number
- Framer Motion slide-in from right

**Step 7: Build StoryIntro**

`StoryIntro.tsx`:
- Full-screen overlay with parchment background
- Story text typewriter effect
- Character portrait on the side
- "继续" (Continue) button

**Step 8: Commit**

```bash
git add -A && git commit -m "feat: add battle scene UI with qi gauge, sprites, and skill animations [ai:y]"
```

---

### Task 8: Level Engine (Challenge → Battle Flow)

**Files:**
- Create: `src/lib/engine/useLevelEngine.ts`
- Create: `src/lib/engine/types.ts`
- Create: `src/lib/engine/codeValidator.ts`
- Test: `src/lib/engine/__tests__/codeValidator.test.ts`

**Step 1: Define engine state machine**

Create `src/lib/engine/types.ts`:
```typescript
export type BattlePhase =
  | 'story_intro'      // Showing narrative
  | 'challenge'        // Player is coding
  | 'validating'       // Running code in Pyodide
  | 'qi_charging'      // Correct! Qi gauge animating up
  | 'error_feedback'   // Wrong! Showing error
  | 'skill_ready'      // Qi full, ready to fire
  | 'skill_animation'  // 武将技 playing
  | 'victory'          // Level complete
  | 'rewards';         // Showing rewards

export interface LevelState {
  phase: BattlePhase;
  currentChallengeIndex: number;
  qiPercent: number;
  stars: number;         // Based on errors/hints used
  errorsUsed: number;
  hintsUsed: number;
}
```

**Step 2: Build codeValidator**

Create `src/lib/engine/codeValidator.ts`:
- For drag/fill challenges: string comparison (normalize whitespace)
- For free_code challenges: run code in Pyodide, compare stdout against `testCases[].expectedOutput`
- Returns: `{ correct: boolean, output: string, error?: string, lineNumber?: number }`

**Step 3: Write tests for codeValidator**

```typescript
test('validates print output', async () => {
  const result = await validateCode('print("hello")', [{ expectedOutput: 'hello\n' }])
  expect(result.correct).toBe(true)
})

test('catches syntax error with line number', async () => {
  const result = await validateCode('prin("hello")', [{ expectedOutput: 'hello\n' }])
  expect(result.correct).toBe(false)
  expect(result.error).toContain('NameError')
})

test('catches wrong output', async () => {
  const result = await validateCode('print("bye")', [{ expectedOutput: 'hello\n' }])
  expect(result.correct).toBe(false)
})
```

**Step 4: Run tests**

```bash
npx vitest run src/lib/engine
```

**Step 5: Build useLevelEngine hook**

Create `src/lib/engine/useLevelEngine.ts`:
```typescript
export function useLevelEngine(chapter: Chapter) {
  // State machine managing BattlePhase transitions
  // Integrates usePyodide for code execution
  // Tracks qi gauge, stars, errors, hints
  // Returns:
  //   state: LevelState
  //   currentChallenge: Challenge
  //   submitCode: (code: string) => Promise<void>
  //   useHint: () => string | null
  //   nextPhase: () => void  (for advancing from story/victory)
  //   rewards: chapter.rewards (available when phase === 'rewards')
}
```

State transitions:
- `story_intro` → (user clicks continue) → `challenge`
- `challenge` → (user submits code) → `validating`
- `validating` → (correct) → `qi_charging` → (if qi < 100) → `challenge` (next)
- `validating` → (correct, qi >= 100) → `qi_charging` → `skill_ready` → `skill_animation` → `victory` → `rewards`
- `validating` → (wrong) → `error_feedback` → `challenge` (same, retry)

**Step 6: Commit**

```bash
git add -A && git commit -m "feat: add level engine with state machine and code validator [ai:y]"
```

---

### Task 9: Battle Page (Putting It Together)

**Files:**
- Create: `src/app/battle/[chapterId]/page.tsx`
- Create: `src/app/battle/[chapterId]/loading.tsx`
- Modify: `src/components/battle/BattleScene.tsx` — wire up level engine

**Step 1: Create battle route**

`src/app/battle/[chapterId]/page.tsx`:
- Server component that loads chapter data by ID
- Auth check (redirect to `/login` if not authenticated)
- Passes chapter data to `<BattleScene>` client component

**Step 2: Create loading state**

`src/app/battle/[chapterId]/loading.tsx`:
- "军师正在布阵..." (The strategist is preparing the formation...) loading text
- Parchment background with spinning compass animation

**Step 3: Wire BattleScene to level engine**

Connect `useLevelEngine` to:
- `CodeEditorSwitch` → `submitCode`
- `QiGauge` → `state.qiPercent`
- `Battlefield` → soldier positions based on qi
- `SkillAnimation` → triggered when `phase === 'skill_animation'`
- `ErrorFeedback` → shown when `phase === 'error_feedback'`
- `StoryIntro` → shown when `phase === 'story_intro'`

**Step 4: Add victory/rewards screen**

When `phase === 'rewards'`:
- Show earned XP with counting animation
- Show unlocked generals (card flip reveal)
- Show stars (1-3)
- Show Three Kingdoms quote if applicable
- "继续" button → navigate to `/map`

**Step 5: Save progress to DB**

After rewards screen, call API route to save:
- `userProgress`: chapter completion, stars, best code
- `userGenerals`: newly unlocked generals
- `userItems`: newly unlocked items
- `users`: update XP and level

Create: `src/app/api/progress/route.ts` — POST handler.

**Step 6: Test full flow manually**

```bash
npm run dev
```

Navigate to `/battle/chapter-00`, play through all 3 challenges of 桃园三结义.

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: add battle page with full challenge-to-reward flow [ai:y]"
```

---

## Phase 3: Game Pages

### Task 10: Overworld Map Page

**Files:**
- Create: `src/app/map/page.tsx`
- Create: `src/components/map/ThreeKingdomsMap.tsx`
- Create: `src/components/map/CityNode.tsx`
- Create: `src/components/map/MapPath.tsx`

**Step 1: Build map layout**

`src/app/map/page.tsx`:
- Server component: fetch user progress, available chapters
- Display `<ThreeKingdomsMap>` client component

**Step 2: Build ThreeKingdomsMap**

`ThreeKingdomsMap.tsx`:
- SVG-based map of ancient China (simplified, cartoon style)
- Background: generated Nano Banana Pro map image
- Overlay SVG cities as interactive nodes
- Paths between cities as SVG lines (animated dash-stroke for "march routes")
- Four act regions visually grouped (color-coded)
- Current act highlighted, future acts dimmed

**Step 3: Build CityNode**

`CityNode.tsx`:
- Completed: Shu red flag (蜀汉旗), glowing, stars shown
- Current (unlocked, not completed): pulsing gold border, "攻城!" label
- Locked: grayed out, lock icon
- Click → navigate to `/battle/[chapterId]`
- Framer Motion: flag plant spring animation on first render for completed cities

**Step 4: Build MapPath**

`MapPath.tsx`:
- SVG `<path>` between cities
- Completed paths: solid red line
- Current path: animated dashed line (march animation)
- Locked paths: dotted gray

**Step 5: Add top navigation bar**

Show on map page:
- Player name + level
- XP bar (progress to next level)
- Links to: 武将图鉴 (/generals), 兵书 (/study), 个人 (/profile)

**Step 6: Test and commit**

```bash
npm run dev  # verify map renders, city clicks navigate to battle
git add -A && git commit -m "feat: add overworld map with city nodes and progress visualization [ai:y]"
```

---

### Task 11: General Collection Gallery

**Files:**
- Create: `src/app/generals/page.tsx`
- Create: `src/components/generals/GeneralCard.tsx`
- Create: `src/components/generals/GeneralDetail.tsx`
- Create: `src/app/api/generals/route.ts`

**Step 1: Build gallery page**

`src/app/generals/page.tsx`:
- Fetch all generals + which ones user has unlocked
- Grid layout (4 columns)
- Unlocked: full color card with Q-style portrait
- Locked: silhouette with "???" and "完成[chapter]解锁"

**Step 2: Build GeneralCard**

`GeneralCard.tsx`:
- Card with portrait, name, faction color border
- Faction badge (蜀/魏/吴)
- Skill name badge
- Click → expand to GeneralDetail
- Framer Motion: hover scale + glow

**Step 3: Build GeneralDetail**

`GeneralDetail.tsx`:
- Modal overlay with full general info:
  - Large portrait
  - Name + title (e.g., 关羽 — 武圣)
  - Core trait (义)
  - Weapon + mount
  - 武将技 name and description
  - Famous quote
  - Which chapter unlocked them

**Step 4: Create API route**

`src/app/api/generals/route.ts`:
- GET: returns all generals with unlock status for current user

**Step 5: Test and commit**

```bash
npm run dev  # verify gallery shows, locked/unlocked states work
git add -A && git commit -m "feat: add general collection gallery with detail view [ai:y]"
```

---

### Task 12: Study Mode (兵书)

**Files:**
- Create: `src/app/study/page.tsx`
- Create: `src/components/study/ConceptCard.tsx`
- Create: `src/lib/levels/concepts.ts`

**Step 1: Define concept data**

`src/lib/levels/concepts.ts`:
```typescript
export interface PythonConcept {
  id: string;
  name: string;          // "print() 输出"
  threeKingdomsName: string;  // "落日弓"
  description: string;   // Kid-friendly explanation
  example: string;       // Code example
  unlockedByChapter: string;
}
```

Define all concepts taught across 16 chapters.

**Step 2: Build study page**

`src/app/study/page.tsx`:
- Styled as a 兵书 (military strategy book) / scroll
- List of concepts grouped by Act
- Unlocked concepts shown in full
- Locked concepts shown as "尚未习得" (not yet learned)

**Step 3: Build ConceptCard**

`ConceptCard.tsx`:
- Bamboo slip (竹简) visual style
- Concept name in calligraphy style
- Three Kingdoms alias (e.g., "循环 = 连环计")
- Runnable code example (click to try in mini Pyodide sandbox)
- "来自关卡：温酒斩华雄" link

**Step 4: Test and commit**

```bash
npm run dev  # verify study page renders with concepts
git add -A && git commit -m "feat: add study mode (兵书) with Python concept review [ai:y]"
```

---

### Task 13: Landing Page & Profile

**Files:**
- Modify: `src/app/page.tsx` — full landing page
- Create: `src/app/profile/page.tsx`
- Create: `src/components/profile/StatsPanel.tsx`
- Create: `src/components/profile/AchievementList.tsx`

**Step 1: Build landing page**

`src/app/page.tsx`:
- Hero section: game title "卧龙学堂" in calligraphy, subtitle "用Python征服三国"
- Animated Three Kingdoms scene (generated image as background)
- "开始游戏" button (large, red with gold border)
- Brief feature highlights (3 cards): 三国故事 / 编程战斗 / 武将收集
- Light parchment theme throughout

**Step 2: Build profile page**

`src/app/profile/page.tsx`:
- Player info: name, level, XP bar
- Stats: chapters completed, generals collected, total stars
- Play time estimation

**Step 3: Build StatsPanel**

Visual stats with Three Kingdoms flavor:
- "攻城数" (Cities conquered) = chapters completed
- "麾下武将" (Generals under command) = generals collected
- "战功" (Battle merit) = total XP
- "最高评价" (Highest rating) = average stars

**Step 4: Build AchievementList**

List of achievements with unlock status:
- Unlocked: gold badge + description + date
- Locked: gray silhouette + "???"
- E.g., "桃园之誓 — 完成第一关" / "赤壁大捷 — 击败Boss关"

**Step 5: Test and commit**

```bash
npm run dev  # verify landing + profile pages
git add -A && git commit -m "feat: add landing page and player profile with achievements [ai:y]"
```

---

## Phase 4: Content & Art Assets

### Task 14: Generate Game Art with Nano Banana Pro

**Files:**
- Create: `public/assets/generals/` — 20 general card images
- Create: `public/assets/scenes/` — 8 battle backgrounds
- Create: `public/assets/map/` — 1 overworld map
- Create: `public/assets/items/` — 12 item icons
- Create: `public/assets/skills/` — 10 skill effect images
- Create: `scripts/generate-assets.sh`

**Step 1: Generate general cards (Act I characters)**

Use Nano Banana Pro for each general. Prompt template:
```
Cute cartoon chibi-style Three Kingdoms warrior [NAME], [DESCRIPTION],
Q-version character design, colorful, white background,
game card portrait style, Chinese historical fantasy,
kid-friendly, bright colors, detailed armor and weapon
```

Generate first batch (Act I unlocks):
- 刘备 (dual swords, green robes, kind face)
- 关羽 (Green Dragon Blade, red face, long beard)
- 张飞 (serpent spear, fierce expression, dark skin)
- 吕布 (Sky Piercer halberd, magnificent armor, Red Hare horse)
- 貂蝉 (elegant, beautiful, silk dress)
- 曹操 (ambitious expression, blue/black robes, crown)

Command per image (use the `nanobanana` skill via Claude Code's Skill tool, or run the script directly):
```bash
# If running manually, set NANOBANANA=path/to/nanobanana.py or use: which nanobanana || echo "Install via claude-code-settings plugin"
python3 "${NANOBANANA:-nanobanana.py}" \
  --prompt "Cute cartoon chibi-style Three Kingdoms warrior 关羽 (Guan Yu), red face, long beautiful beard, wearing green robes with golden armor, wielding the legendary Green Dragon Crescent Blade (青龙偃月刀), riding Red Hare horse, Q-version character design, colorful, white background, game card portrait, Chinese historical fantasy, kid-friendly, bright warm colors" \
  --size 1024x1024 \
  --model gemini-3-pro-image-preview \
  --output "public/assets/generals/guan-yu.png"
```

**Step 2: Generate battle backgrounds**

8 scenes (2 per act):
- Act I: Peach garden (桃园), Guandu battlefield (官渡)
- Act II: Thatched cottage (茅庐), Red Cliffs (赤壁)
- Act III: Changban slope (长坂坡), Flooded battlefield (水淹七军)
- Act IV: Southern jungle (南蛮), Wuzhang Plains (五丈原)

```bash
python3 .../nanobanana.py \
  --prompt "Cartoon illustration of ancient Chinese peach garden in spring, pink cherry blossoms, three warriors standing under a peach tree, warm sunset lighting, kid-friendly art style, game background, landscape orientation, bright and colorful" \
  --size 1344x768 \
  --model gemini-3-pro-image-preview \
  --output "public/assets/scenes/peach-garden.png"
```

**Step 3: Generate overworld map**

```bash
python3 .../nanobanana.py \
  --prompt "Cartoon illustrated map of ancient China during the Three Kingdoms period, showing major cities connected by roads, mountains, rivers (Yellow River, Yangtze), colorful cartoon style, bird's eye view, game map style, labeled regions for Wei (blue/north), Shu (red/west), Wu (green/east), parchment paper texture background, kid-friendly bright colors" \
  --size 1344x768 \
  --model gemini-3-pro-image-preview \
  --output "public/assets/map/three-kingdoms-map.png"
```

**Step 4: Generate remaining generals (Act II-IV)**

- 诸葛亮, 鲁肃, 周瑜, 黄盖, 孙权 (Act II)
- 赵云, 马超, 黄忠 (Act III)
- 孟获, 司马懿, 姜维 (Act IV)

**Step 5: Generate item icons**

Weapons (青龙偃月刀, etc.), mounts (赤兔马), books (孙子兵法), pouches (锦囊).

**Step 6: Generate skill animation frames**

Key frames for: 落日弓 (arrow), 连弩激射 (crossbow volley), 火龙 (fire dragon), 天地无用 (ultimate).

**Step 7: Commit all assets**

```bash
git add public/assets/ && git commit -m "feat: add AI-generated game art assets (generals, scenes, map, items) [ai:y]"
```

---

### Task 15: Build Complete Levels 0-5 (Act I)

**Files:**
- Modify: `src/lib/levels/chapters/chapter-00.ts` through `chapter-05.ts`
- Reference: Level design tables from design doc Section 4

**Step 1: Finalize Chapter 0 (桃园三结义)**

Ensure all 3 challenges are fully specified with:
- Drag options (correct + distractors)
- Test cases
- Hints (3 levels: gentle → direct → near-answer)
- Qi reward values summing to 100%

**Step 2: Build Chapter 2 (三英战吕布 — Functions)**

3 challenges:
1. Drag: arrange `def attack(weapon):` and `print(weapon + "出击!")` in correct order
2. Fill: `def three_heroes(___):` fill parameter name
3. Fill+Code: Call the function three times with different heroes

**Step 3: Build Chapter 3 (连环计 — if/else)**

3 challenges:
1. Fill: `if target == "___":` choose correct condition
2. Fill: Complete an if/elif/else chain
3. Code: Write a simple conditional that determines the stratagem outcome

**Step 4: Build Chapter 4 (官渡之战 — Lists)**

3 challenges:
1. Fill: `supplies = ["粮草", "___", "帐篷"]` complete the list
2. Fill: `supplies.append("___")` add item
3. Code: `for item in supplies: print("烧毁:" + item)`

**Step 5: Build Chapter 5 (过五关斩六将 — for loop)**

3 challenges:
1. Fill: `for i in range(___):` fill the count (5 passes)
2. Fill+Code: Loop with conditional inside
3. Code: Write a for loop that prints each pass and general defeated

**Step 6: Validate all chapters**

```bash
npx vitest run src/lib/levels
```

**Step 7: Commit**

```bash
git add -A && git commit -m "feat: complete all Act I chapters (0-5) with challenges [ai:y]"
```

---

## Phase 5: Deploy & Polish

### Task 16: Vercel Deployment

**Files:**
- Create: `vercel.json` (if needed)
- Modify: `next.config.ts` — configure for Vercel

**Step 1: Configure Vercel project**

```bash
npx vercel link
```

**Step 2: Set up Vercel Postgres**

```bash
npx vercel env pull .env.local  # pull DB credentials after creating in Vercel dashboard
```

**Step 3: Run migration**

```bash
npx drizzle-kit push
```

**Step 4: Seed database**

```bash
npx tsx src/db/seed.ts
```

**Step 5: Deploy**

```bash
npx vercel --prod
```

**Step 6: Verify deployment**

Open the deployed URL, test:
- Login with Google
- Navigate map
- Play Level 0 (桃园三结义) end-to-end
- Check general unlocks
- Check progress saves

**Step 7: Commit any deployment fixes**

```bash
git add -A && git commit -m "feat: configure Vercel deployment [ai:y]"
```

---

### Task 17: Build Act II-IV Chapters (6-15)

**Files:**
- Create: `src/lib/levels/chapters/chapter-06.ts` through `chapter-15.ts`

This task follows the same pattern as Task 15 but for the remaining acts. Each chapter needs:
- 3 challenges with appropriate interaction mode
- Test cases validated against Pyodide
- Accurate Three Kingdoms narrative in storyIntro
- Correct rewards (generals, items, quotes)

**Chapters to build:**
- 06: 三顾茅庐 (while loop)
- 07: 舌战群儒 (debugging)
- 08: 草船借箭 (list ops)
- 09: 赤壁之战 BOSS (4-phase combined)
- 10: 长坂坡 (search)
- 11: 单刀赴会 (stack)
- 12: 水淹七军 (queue + sort)
- 13: 七擒孟获 (while + dict)
- 14: 空城计 (encapsulation)
- 15: 木牛流马 (custom data structure)

**Commit after each act:**
```bash
git commit -m "feat: complete Act II chapters (6-9) [ai:y]"
git commit -m "feat: complete Act III chapters (10-12) [ai:y]"
git commit -m "feat: complete Act IV chapters (13-15) + finale [ai:y]"
```

---

## Summary

| Phase | Tasks | What's Built |
|-------|-------|-------------|
| 1. Foundation | 1-4 | Project, Pyodide, DB, Auth |
| 2. Core Engine | 5-9 | Levels, Editors, Battle UI, Engine, Battle Page |
| 3. Game Pages | 10-13 | Map, Generals, Study, Landing/Profile |
| 4. Content & Art | 14-15 | AI art assets, Act I chapters complete |
| 5. Deploy & Expand | 16-17 | Vercel deploy, Act II-IV chapters |

**MVP milestone:** After Task 16, the game is playable end-to-end with Act I (6 levels). Acts II-IV (Task 17) can be added incrementally.
