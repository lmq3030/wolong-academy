# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project: 卧龙学堂 (The Sleeping Dragon Academy)

A browser-based Python learning game for children (ages 8-9). Three Kingdoms themed — writing correct Python code charges a qi gauge to trigger 武将技 battle animations. Built with Next.js 16 App Router, Pyodide (WebAssembly Python), and Framer Motion.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint
npx vitest           # Run all tests
npx vitest run src/lib/engine/__tests__/useLevelEngine.test.ts  # Single test file
```

## Architecture

### Game Loop (State Machine)

The battle phase state machine is the core of the game, defined in `src/lib/engine/types.ts`:

```
concept_intro → story_intro → challenge → validating → qi_charging/error_feedback → skill_ready → skill_animation → victory → rewards
```

- **`useLevelEngine`** (`src/lib/engine/useLevelEngine.ts`) — Hook managing phase transitions, qi gauge, star scoring, hint system
- **`codeValidator`** (`src/lib/engine/codeValidator.ts`) — Static validation (drag/fill) and dynamic validation (Pyodide execution)
- **`BattleScene`** (`src/components/battle/BattleScene.tsx`) — Main battle orchestrator, renders overlays per phase

### Code Execution

Python runs in-browser via **Pyodide** in a Web Worker (`src/lib/pyodide/worker.ts`). The `usePyodide` hook (`src/lib/pyodide/usePyodide.ts`) manages worker lifecycle including timeout recovery (terminates and recreates worker if code blocks).

### Level Data

Chapters are in `src/lib/levels/chapters/chapter-{00-05}.ts`. Each chapter defines challenges with three interaction modes (progressive difficulty):
- **Drag & Drop** — `DragDropEditor` with randomized options
- **Fill-in-the-blank** — `FillBlankEditor` with button-pill choices
- **Free Code** — `FreeCodeEditor` with Pyodide execution

Python concept explanations are in `src/lib/levels/concepts.ts`.

### Progress & Users

Multi-user localStorage system. Progress is user-scoped (`wolong-progress-{userId}`).
- `src/lib/progress.ts` — getProgress, saveChapterProgress, isChapterUnlocked
- `src/lib/user.ts` — createUser, switchUser, getCurrentUser

### TTS

Doubao (豆包) TTS via `/api/tts` route. Requires `DOUBAO_APP_ID` and `DOUBAO_ACCESS_TOKEN` in `.env.local`.

### Key Patterns

- `BattlePhase` type is defined once in `src/lib/engine/types.ts` — import from there, never redefine
- `CodeEditorSwitch` uses `key={challenge.id}` to force clean remount between challenges
- Framer Motion springs: never use array keyframes with `type: 'spring'` (causes error)
- Phase overlays use `AnimatePresence` for enter/exit animations
- Always-render with `hidden` class for conditional UI (avoids hydration mismatch)
- Use `<img>` tags for scene backgrounds (CSS `background: url()` fails during hydration)

## Stack

- **Next.js 16.2.1** (App Router, Turbopack) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (PostCSS integration, no tailwind.config)
- **Framer Motion 12** for animations
- **Pyodide** for in-browser Python execution
- **Vitest 4** + Testing Library for tests
- **Drizzle ORM** + Vercel Postgres (schema exists but MVP uses localStorage)

## Test Conventions

Tests are colocated in `__tests__/` folders next to their modules. Use `vitest` with `jsdom` environment. Path alias `@/` resolves to `src/`.
