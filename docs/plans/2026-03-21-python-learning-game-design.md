# Design Doc: 卧龙学堂 (The Sleeping Dragon Academy)

> Python Learning Game for Kids (Age 8-9) with Three Kingdoms Theme
> Date: 2026-03-21
> Status: Approved

---

## 1. Overview

An interactive browser-based game that teaches Python programming and introductory data structures & algorithms to 8-9 year old children, themed around Romance of the Three Kingdoms (三国演义) with gameplay elements inspired by 三国群英传2.

### Target User
- 8-9 years old
- Has Scratch experience (understands loops, conditionals, variables conceptually)
- Deep Three Kingdoms knowledge and enthusiasm
- Recently played 三国群英传2, loves its battle system and general collection

### Goals
1. Teach Python fundamentals through the transition from block-based (Scratch) to text-based coding
2. Introduce beginner-level data structures & algorithms (list, stack, queue, dict, sorting, searching)
3. Maximize engagement through Three Kingdoms narrative and 三国群英传2-style battle mechanics
4. Minimize frustration via drag-drop/fill-blank/choice interactions (reduce typing)

---

## 2. Core Design: Programming as Combat

The central innovation is mapping "writing code" to "releasing 武将技 (general skills)" from 三国群英传2.

### Three-Mode Game Loop

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   内政模式        │────▸│   大地图          │────▸│   战斗模式        │
│  (Learn concepts) │     │  (Choose level)   │     │  (Code challenge) │
│  Read 兵书=syntax  │     │  Siege city=level  │     │  Write code=skill │
│  Search=easter egg │     │  March route=story │     │  Correct=skill hit │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                                              │
        └──────────────────────────────────────────────┘
```

### Battle Mode (Core Gameplay)

Screen split into two halves:
- **Top: Battlefield** — Horizontal 2D side-scrolling (三国群英传2 style), player general + soldiers vs enemy general + soldiers
- **Bottom: Code Area** — Drag/fill/free-code editor

**Qi Gauge Mechanic:**
- Each correct code segment charges the qi gauge
- Full gauge → trigger 武将技 animation (the peak dopamine moment)
- Code errors → troops get pushed back, encouraging retry without punishment

**Error Feedback (Three Kingdoms style, not cold error messages):**
- Syntax error → "军师摇了摇羽扇：'此计尚有破绽，第3行的阵法还需调整。'"
- Logic error → Skill fires but misses, showing what went wrong
- Always encouraging: "军师再想想，敌阵尚未攻破。"

### Three-Layer Interaction (Progressive Bridge from Scratch)

| Layer | Interaction | Stage | Example |
|-------|------------|-------|---------|
| Layer 1: Drag & Drop | Drag Python code blocks to correct position | Act I first half | Drag `print("桃园结义")` to the right slot |
| Layer 2: Fill-in + Choice | Code framework given, fill key parts | Act I second half ~ Act II | `for i in range(___):` fill correct number |
| Layer 3: Free Coding | Mini-editor with smart autocomplete | Act III ~ Act IV | Write a sorting function for the Five Tiger Generals |

All three layers coexist — a single level may mix modes.

---

## 3. General System (Inspired by 三国群英传2)

### Character Collection
- Complete levels → unlock general cards (cartoon style, generated via Nano Banana Pro)
- ~20 core generals across all factions

### Attribute System
| Attribute | 三国群英传2 Original | 卧龙学堂 Adaptation |
|-----------|---------------------|-------------------|
| 武力 (Martial) | Combat attack power | Code speed bonus |
| 智力 (Intelligence) | Strategist skill power | Algorithm efficiency |
| 体力 (HP) | Hit points | Allowed error count |
| 技力 (Skill Power) | Skill energy | Available hint count |

### Python Concept → 武将技 Mapping

| Python Concept | Unlocked Skill | Visual Effect |
|---------------|---------------|---------------|
| `print()` | 落日弓 R002 | Arrow flies, output text appears |
| Variable assignment | 命疗术 R001 | General heals, variable value shows on HP bar |
| `if/elif/else` | 伏兵组阵 R005 | Ambush soldiers appear from different directions based on condition |
| `for` loop | 连弩激射 R062 | Rapid-fire arrows, one per loop iteration |
| `while` loop | 七擒孟获 (custom) | Capture-release animation until condition met |
| List operations | 十面埋伏 R040 | Soldiers from list surround from 10 directions |
| Function definition | 八阵图 R080 | Reusable formation assembles |
| Sorting algorithms | 五虎将点兵 (custom) | Five Tiger Generals rearrange by attribute |
| Stack/Queue | 木牛流马 (custom) | Supplies load/unload one by one |
| Search algorithms | 赵云长坂坡 (custom) | Zhao Yun searches through enemy lines for A Dou |
| Dict/Hash | 锦囊妙计 (custom) | Open the right silk pouch, retrieve the right strategy |

### Equipment System
| Slot | Type | Effect |
|------|------|--------|
| 兵书 (Book) | Hint unlocks | Provides extra hints for challenges |
| 坐骑 (Mount) | Skip pass | Can skip one sub-challenge |
| 武器 (Weapon) | Code template | Pre-fills part of the code |
| 锦囊 (Pouch) | Answer clue | Reveals a key part of the solution |

### Algorithm Selection (兵种相克 Adaptation)
In certain levels, players choose algorithms like choosing unit types:
- Large data → efficient algorithm (binary search) = correct unit matchup
- Complex conditions → correct data structure = correct formation
- Wrong choice doesn't fail, but battle is harder (slow qi charging)

---

## 4. Level Design & Curriculum

### Act I: 群雄并起 (Heroes Arise) — Python Basics (6 levels)

| Level | Story Arc | Python Concept | Interaction | Battle Scene | Unlock |
|-------|-----------|---------------|-------------|-------------|--------|
| 0. 桃园三结义 | Liu-Guan-Zhang oath | `print()` | Drag | Tutorial, peach garden | 刘备, 关羽, 张飞 |
| 1. 温酒斩华雄 | Guan Yu slays Hua Xiong | Variables, strings | Drag | Guan Yu vs Hua Xiong, 落日弓 | — |
| 2. 三英战吕布 | Three heroes vs Lu Bu | Functions (def/call) | Drag+Fill | Liu-Guan-Zhang vs Lu Bu, combo | 吕布 (3-star bonus) |
| 3. 连环计 | Diao Chan's chain stratagem | `if/elif/else` | Fill | Logic puzzle, correct condition → plan succeeds | 貂蝉 |
| 4. 官渡之战 | Night raid on Wuchao | List basics | Fill | Cao Cao raid animation, burn supply list | 曹操 |
| 5. 过五关斩六将 | Guan Yu rides alone | `for` loop | Fill+Code | 5 passes, 1 loop each, 连弩激射 | 赤兔马 (equipment) |

### Act II: 卧龙出山 (The Dragon Awakens) — Advanced Syntax (4 levels)

| Level | Story Arc | Python Concept | Interaction | Battle Scene | Unlock |
|-------|-----------|---------------|-------------|-------------|--------|
| 6. 三顾茅庐 | Three visits to Zhuge Liang | `while` loop + break | Fill | Three visits animation, loop until agreed | 诸葛亮 |
| 7. 舌战群儒 | Debating Wu scholars | Debug / find errors | Code (debug) | Each scholar presents buggy code | 鲁肃 |
| 8. 草船借箭 | Borrowing arrows | List ops: append/len/sum | Fill+Code | Straw boats in fog, each append = arrow batch | 周瑜 |
| 9. 赤壁之战 ⭐BOSS | Battle of Red Cliffs | Combined: loops+conditions+lists | Code | 4-phase boss: chains→east wind→fire→Huarong | 黄盖, 孙权 |

**Level 9 Boss Fight Phases:**
1. 铁锁连环 (Chain ships) — List concatenation
2. 借东风 (Borrow east wind) — Conditional wait
3. 火攻 (Fire attack) — Loop through ships
4. 华容道 (Huarong Pass) — if/else: Guan Yu releases Cao Cao

### Act III: 五虎上将 (Five Tiger Generals) — Data Structures (3 levels)

| Level | Story Arc | DS&A Concept | Interaction | Battle Scene | Unlock |
|-------|-----------|-------------|-------------|-------------|--------|
| 10. 长坂坡 | Zhao Yun's solo rescue | Search (linear → binary) | Code | Zhao Yun searches for A Dou, 七进七出 | 赵云 |
| 11. 单刀赴会 | Guan Yu at the banquet | Stack (LIFO) | Fill+Code | Push through ambush layers, pop back out | 青龙偃月刀 (equipment) |
| 12. 水淹七军 | Flooding seven armies | Queue (FIFO) + basic sort | Code | Seven armies swept away in order, 水淹七军 | 马超, 黄忠 |

### Act IV: 鞠躬尽瘁 (Devoted to the End) — Algorithms (3 levels + finale)

| Level | Story Arc | DS&A Concept | Interaction | Battle Scene | Unlock |
|-------|-----------|-------------|-------------|-------------|--------|
| 13. 七擒孟获 | Seven captures of Meng Huo | `while` + Dict | Code | Capture-release cycle, track attribute changes | 孟获 |
| 14. 空城计 | Empty Fort Strategy | Encapsulation / info hiding | Code | Zhuge Liang plays qin, Sima Yi can't see internal state | 司马懿 |
| 15. 木牛流马 | Mechanical transport | Custom data structure (stack+queue+dict) | Code | Design supply system, 木牛流马 | 姜维 |
| Finale. 五丈原 | Wuzhang Plains | Review + free creation | Free | Review all skills, unlock 天地无用 | 诸葛亮 ultimate |

### Side Quests (Post-game)

| Quest | Story | Challenge |
|-------|-------|-----------|
| A. 刮骨疗毒 | Hua Tuo scrapes Guan Yu's bone | Deep debugging: find hidden bugs in complex code |
| B. 火烧连营 | Lu Xun burns 700 li of camps | Anti-pattern lesson: why tight coupling is dangerous |
| C. 八阵图 | Zhuge Liang's stone maze | 2D array + maze pathfinding (BFS/DFS visualization) |
| D. 诸葛连弩工坊 | Invention workshop | Free mode: combine data structures to build inventions |

---

## 5. Technical Architecture

### Stack
| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Animation | Framer Motion + CSS Sprite Animation |
| Python Runtime | Pyodide (WebAssembly, in Web Worker) |
| Auth | NextAuth.js (Google login) |
| Database | Vercel Postgres |
| Asset Storage | Vercel Blob |
| Deployment | Vercel |

### Page Structure
```
/                        → Landing page (三国群英传 style intro animation)
/login                   → Login (parent helps set up Google account)
/map                     → Overworld map (city selection, progress visualization)
/battle/[chapterId]      → Battle mode (core coding challenge page)
/study                   → Study mode (兵书 = concept review)
/generals                → General collection gallery
/profile                 → Player profile (level, achievements, stats)
```

### Data Model (Vercel Postgres)

```sql
-- Users
users: id, name, avatar, level, xp, created_at

-- General collection
generals: id, name, faction, traits, skill_name, image_url
user_generals: user_id, general_id, unlocked_at

-- Level progress
chapters: id, act, title, story_arc, python_concept, difficulty
user_progress: user_id, chapter_id, stars(1-3), best_code, completed_at

-- Equipment/items
items: id, name, type(weapon/horse/book/jewel), effect
user_items: user_id, item_id, equipped_to_general_id

-- Achievements
achievements: id, name, description, trigger_condition
user_achievements: user_id, achievement_id, unlocked_at
```

### Level Data Structure (JSON-driven)

```typescript
interface Chapter {
  id: string;
  act: 1 | 2 | 3 | 4;
  title: string;           // "温酒斩华雄"
  storyIntro: string;      // Story introduction text
  pythonConcept: string;   // "print() 基础输出"
  difficulty: 1-5;
  interactionMode: "drag" | "fill" | "code" | "mixed";
  challenges: Challenge[];
  battle: {
    playerGeneral: string;
    enemyGeneral: string;
    playerSkill: string;
    bgScene: string;
  };
  rewards: {
    xp: number;
    unlockGeneral?: string;
    unlockItem?: string;
    quote?: string;        // Three Kingdoms quote easter egg
  };
}

interface Challenge {
  type: "drag" | "fill_blank" | "multiple_choice" | "free_code";
  prompt: string;
  codeTemplate?: string;
  correctAnswer: string;
  testCases: TestCase[];
  hints: string[];
  qiReward: number;        // Qi gauge charge percentage
}
```

### Pyodide Integration
- Runs in Web Worker (non-blocking UI)
- 5-second timeout per execution (prevents infinite loops)
- Service Worker caches Pyodide (~5-8MB) for instant subsequent loads
- Sandboxed: student code cannot affect the page

### Image Assets (Nano Banana Pro)
| Asset Type | Style | Size | Count |
|-----------|-------|------|-------|
| General cards | Cartoon Q-style Three Kingdoms warriors | 1024x1024 | ~20 |
| Battle backgrounds | Cartoon Three Kingdoms scenes | 1344x768 (16:9) | ~8 |
| Overworld map | Cartoon Three Kingdoms China map | 1344x768 | 1 |
| Skill animation frames | Fire dragons, lightning, arrows | 1024x1024 | ~10 |
| Item icons | Weapons, mounts, books | 1024x1024 | ~12 |

### Animation Approach
- **Battle animations**: Framer Motion + CSS Sprite Animation (not a game engine)
  - Generals and soldiers: sprites + transform animations
  - 武将技: full-screen overlay (flash, particles, zoom)
- **Map**: CSS transitions + SVG path animations
  - Flag planting: spring bounce animation
  - March routes: SVG path stroke animation

---

## 6. Design Principles

1. **Fast battles** — Each level 3-5 minutes, matching 三国群英传2's quick battle pace
2. **Immediate visual feedback** — Every code change produces a visible result within 1 second
3. **Encouraging failure** — Errors are never punitive; Three Kingdoms characters guide retry
4. **Progressive bridging** — Drag → Fill → Free Code, never a cliff-jump
5. **Kid-friendly vocabulary** — Variable = 锦囊, Function = 兵法, Loop = 连环计, List = 点将册
6. **Faithful Three Kingdoms content** — Accurate story arcs, character traits, and quotes that a young enthusiast would appreciate
7. **Power fantasy reward** — The 武将技 animation after correct code is the core dopamine loop
8. **YAGNI** — Start with 16 core levels + 4 side quests; expand only after validated

---

## 7. Out of Scope (MVP)

- Multiplayer / social features
- Custom avatar creation
- More than ~20 generals
- Mobile-responsive design (desktop-first for MVP)
- Voice acting / narration
- Difficulty adaptation (fixed difficulty curve for MVP)
