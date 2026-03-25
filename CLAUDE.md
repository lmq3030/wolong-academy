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

## Concept Teaching Design Principles

The target learner is an **8-9 year old native English speaker** at an international school. Zero programming experience. Every concept must be taught from first principles.

### Core Pedagogy: "Naive Method First"

Every programming concept is an optimization over a "dumb" approach. **Always show the naive/brute-force approach BEFORE introducing the concept.** This lets the child feel the pain point, then appreciate the solution.

| Concept | Show This First (笨办法) | Then Introduce |
|---------|-------------------------|----------------|
| Variables | Hardcoding "赵云" in 10 places, changing one means changing all 10 | `hero = "赵云"` — change once |
| Functions | Copy-paste same 3 lines for each general | `def war_cry(name):` — write once, call many |
| if/else | Code that always does the same thing regardless of situation | Branching based on condition |
| Lists | `hero1`, `hero2`, `hero3`... separate variables per item | `heroes = [...]` — one container |
| for loop | 5 identical `print()` statements | `for i in range(5):` |
| while loop | Using for with a guessed count | `while condition:` — stop when condition is met |
| Dict | Long if/elif chain to look up by name | `plans["第一计"]` — direct key lookup |
| Stack/Queue | Plain list where you accidentally operate from wrong end | Enforced LIFO/FIFO discipline |

### Multi-Step Lesson Structure (ConceptLesson)

Complex concepts use **4-6 steps** (not just 2). The `conceptStepBuilders` in `ConceptLesson.tsx` defines custom step sequences per concept:

1. **Naive method** (笨办法) — show the problem with concrete code
2. **Why this concept** — motivation and analogy
3. **Keyword breakdown** (逐词拆解) — explain every keyword and symbol
4. **Execution trace** — table showing variable values at each step
5. **Code example** — complete working code with output
6. (Optional) **Visual diagram** — AI-generated illustration

### Step Types Supported

Each step can contain one or more of:
- `content` + `detail[]` — text explanation paragraphs
- `breakdown[]` — `{code, label}` pairs for keyword-by-keyword breakdown
- `trace` — `{headers[], rows[][]}` execution trace table
- `code` + `output` — runnable code example with expected output
- `image` + `imageCaption` — visual diagram (stored in `/public/assets/concepts/`)

### No Hidden Assumptions

**Every concept/symbol must be explicitly taught before use.** Known assumptions that have been addressed:
- **Indentation**: What it is, Tab key, why 4 spaces (taught in functions, first concept to use it)
- **# comments**: Explained in print (first concept)
- **Dot syntax** `.method()`: Explained when lists introduce `.append()`
- **print comma syntax**: Explained in for-loop (逗号分隔多个参数)
- **True/False (boolean)**: Explained in if/else breakdown
- **str() type conversion**: Explained with error example in strings
- **Colon `:` rule**: Explained in each concept that uses it (functions, if, for, while, class)
- **`import`**: Explained in queue (first concept to use it)

### Visual Diagrams

Generated with Gemini via NanoBanana, stored in `public/assets/concepts/`:
- `for-loop-flow.png` — Step-by-step execution flowchart
- `for-vs-while.png` — Side-by-side comparison diagram
- `range-generator.png` — Conveyor belt visualization of range()

### Research-Backed Practices

Based on analysis of Code.org, Scratch, Khan Academy, and Chinese platforms:
- **Body/physical metaphor first, syntax last** — real-world analogy before code
- **Unroll before abstracting** — show verbose version, then compress into abstraction
- **Execution traces > flowcharts** for ages 8-9 (simplified 2-3 column tables)
- **Visual enclosure** — indented code should feel "inside" the loop/function
- **Immediate visual output** — each iteration should produce a visible result
