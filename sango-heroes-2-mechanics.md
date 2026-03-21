# 三国群英传2 (Sango Heroes 2 / Heroes of the Three Kingdoms 2) — Game Mechanics Research

> Developer: 宇峻奥汀 (USERJOY Technology / Odin, later merged into UserJoy Technology)
> Release: July 16, 1999 (PC); November 13, 2020 (Steam re-release)
> Genre: Real-time strategy with RPG elements
> Setting: 185 CE (Yellow Turban Rebellion) through 280 CE (Jin reunification)
> Widely considered the best entry in the 7-game series

---

## 1. Core Game Loop — Three Interlocking Modes

The game cycles through three distinct modes, each feeding into the next:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  INTERNAL AFFAIRS│────▸│   OVERWORLD MAP  │────▸│  REAL-TIME BATTLE│
│  (内政经营模式)    │     │  (大地图模式)      │     │  (战斗模式)       │
│  Triggers: Jan   │     │  Duration: 1 year │     │  Triggers: armies │
│  each year       │     │  (real-time flow)  │     │  meet or siege    │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        ▲                                              │
        └──────────────────────────────────────────────┘
                    (cycle repeats)
```

### What makes this fun
The loop is tight and fast-paced. Unlike heavier strategy games (e.g., Romance of the Three Kingdoms / 三国志 series by Koei), there is minimal "busywork" in the internal affairs phase. The game deliberately emphasizes warfare over paperwork: you spend most of your time marching armies and fighting battles, not managing spreadsheets. This streamlined design is a major reason kids love it.

---

## 2. Internal Affairs Mode (内政经营模式)

**Triggers every January.** Each city you control generates tax revenue based on population.

### Available Actions Per City
| Action | Effect |
|--------|--------|
| **搜索 (Search)** | Send a general to search the city. Can discover: wandering generals (recruit them!), weapons, horses, formation manuals (阵型之书), tomes, jewelry, and special items. The thrill of finding a legendary weapon or a powerful unaligned general is a huge hook. |
| **开发 (Develop)** | Invest in the city. Increases population (max 1,000,000) and defense rating (max 999). Higher population = more tax income + higher reserve troop cap. |
| **自治 (Auto-govern)** | Let the city manage itself automatically. Useful for backline cities. |

### Economy
- **Tax income** arrives each January, proportional to city population
- Gold automatically converts into **reserve troops (预备兵)** at a 100 gold : 1 soldier ratio throughout the year on the overworld map
- Population and defense can be damaged by enemy attacks, creating a meaningful defense incentive

### Key Design Insight
The "search" mechanic doubles as a slot-machine / gacha-like dopamine loop: you never know if you'll find a legendary item or a famous general hiding in a minor city. This randomized discovery system is extremely addictive for kids.

---

## 3. Overworld Map Mode (大地图模式)

After internal affairs concludes, the map comes alive for one in-game year. Time flows continuously (not turn-based).

### What You See
- A stylized 2D map of ancient China with cities connected by roads
- Each faction's cities marked with colored flags (red, blue, yellow, etc.)
- Army units moving along roads as small sprite groups
- Geographic features: mountains, rivers, passes

### Strategic Actions
| Action | Description |
|--------|-------------|
| **Organize armies (组织兵团)** | Group up to 5 generals into a single army. Each army must designate one **军师 (strategist/military advisor)** who determines which strategist skills are available in battle. |
| **Deploy armies** | Send armies to march toward target cities or intercept enemies |
| **Assign generals** | Transfer generals between cities; set city governors |
| **Defensive positioning** | Station armies to guard key chokepoints |

### Army Composition
- Each army = up to **5 generals** + their individual soldier contingents
- Each general brings their own troop type and count (based on level)
- The army's strategist determines available 军师技 (strategist skills) in battle
- Generals have **忠诚度 (loyalty)**, **士气 (morale)**, and **疲劳度 (fatigue)** that affect performance

### Triggering Battles
When two opposing armies collide on a road, or when an army arrives at an enemy city, the game transitions to real-time battle mode.

### Five Historical Scenarios
Players choose from five starting eras, each with different faction layouts and available generals:

| Era | Date | Situation |
|-----|------|-----------|
| 黄巾之乱 (Yellow Turban Rebellion) | 185 CE | Many small factions; chaotic; most generals available to recruit |
| 讨伐董卓 (Campaign vs. Dong Zhuo) | ~190 CE | Coalition against Dong Zhuo; Lv Bu at peak power |
| 群雄割据 (Warlord Fragmentation) | ~196 CE | Cao Cao, Liu Bei, Sun Ce all building power |
| 赤壁之战 (Battle of Red Cliffs) | ~208 CE | Three major powers crystallizing |
| 三国鼎立 (Three Kingdoms) | ~220 CE | Wei, Shu, Wu established; next-gen generals |

---

## 4. Battle System (战斗模式) — The Heart of the Game

This is where the game truly shines and what kids remember most vividly.

### Pre-Battle Setup
Before combat begins, a preparation screen lets you:
1. **Choose deployment order** — which general fights first, second, etc.
2. **Select formation** — from 9 available formations (if the general has learned them)
3. **Position the general** — front, middle, or rear of their troops
4. **Set strategist command** — the military advisor's opening gambit
5. **Choose retreat** (3 consecutive retreats without entering a city = entire army captured)

### Battle Flow
```
┌────────────────────────────────────────────────┐
│              ELIMINATION FORMAT                 │
│                                                │
│  Each side sends ONE general + their troops    │
│           ┌──────────────┐                     │
│           │  REAL-TIME   │                     │
│           │   COMBAT     │                     │
│           │  (side-view) │                     │
│           └──────┬───────┘                     │
│                  │                              │
│        ┌─────────┼─────────┐                   │
│        ▼         ▼         ▼                   │
│     WINNER    DRAW      LOSER                  │
│   (fights    (both     (eliminated,            │
│    again)    retire)   cannot redeploy)        │
│                                                │
│  Continues until one side has no generals left │
└────────────────────────────────────────────────┘
```

### Real-Time Combat Mechanics

The battlefield is a **horizontal side-scrolling 2D field**. Your general is on the left, the enemy on the right. Each general has their **formation of soldiers** arranged around them.

**What happens in real-time:**
- Soldiers from both sides clash automatically based on formation and position
- The **general (武将)** is the hero unit — much stronger than individual soldiers
- The general has a **气力条 (energy/qi gauge)** that fills over time
- When the gauge is full, the general can unleash a **武将技 (general skill)** — a powerful special attack with spectacular visual effects
- The strategist's chosen **军师技 (strategist skill)** activates at battle start and provides tactical bonuses

**Player Controls During Battle:**
| Command | Effect |
|---------|--------|
| 全军突击 (All-out assault) | All troops charge forward |
| 全军后退 (Full retreat) | All troops fall back |
| 武将出击 (General charges) | Your general rushes forward to engage the enemy general directly |
| 左右分散 (Spread out) | Troops spread to flanks |
| 武将技 (Special skill) | Activate when qi gauge is full — the big flashy move |

### The General Duel (Single Combat)
When both generals close on each other with most soldiers eliminated, it becomes effectively a **1v1 duel** — the most exciting moment in any battle. Key mechanics:
- Attack priority: every 2-3 hits against surrounding soldiers, 1 hit targets the enemy general
- To force a clean duel: use ranged troops to bait the enemy into charging, then pull your troops back while your general rushes forward
- Some generals have the **一骑 (Solo Rider)** trait, which massively accelerates qi charging during duels — making characters like Guan Yu and Lu Bu terrifying in single combat
- The moment your general's qi gauge fills and you unleash a devastating skill on the enemy general is the peak dopamine moment of the entire game

### Post-Battle
After winning, for each captured enemy general you choose:
| Choice | Effect |
|--------|--------|
| **招降 (Recruit)** | Attempt to recruit the enemy general — success depends on your charisma vs. their loyalty |
| **斩首 (Execute)** | Kill the enemy general permanently — removes them from the game |
| **释放 (Release)** | Let them go — they return to their faction |

**Key design note:** There is NO "prison" system. You cannot hold prisoners indefinitely. This creates tension: you desperately want to recruit that amazing enemy general, but if recruitment fails, do you execute or release? Kids agonize over this choice, especially when facing a beloved Three Kingdoms character.

---

## 5. Character / General System (武将系统)

### Core Attributes
| Attribute | Range | Effect |
|-----------|-------|--------|
| **武力 (Martial Prowess)** | 30-100 | 4 points = +1 melee attack; 8 points = +1 ranged attack; 3 points = +5 carrying capacity |
| **智力 (Intelligence)** | 25-106 | Affects strategist skill success rate and some skill damage |
| **体力 (HP / Health)** | Scales with level | The general's hit points in battle |
| **技力 (Skill Power / MP)** | Scales with level | Energy pool for activating 武将技 |
| **带兵数 (Troop Count)** | Scales with level | How many soldiers the general commands |

### Leveling System
- Generals gain **experience (经验值)** from battles
- Experience scales with enemy level: defeating high-level enemies grants more XP
- **Dismounting an enemy general** (knocking them off their horse) grants bonus XP
- In a 5-general army, the most-deployed general gets the lion's share of XP; others get smaller portions
- Even generals who didn't fight in the army get a trickle of XP from victories

### Level Progression
| Level | Key Milestone |
|-------|--------------|
| 1-19 | Each level: +5 troop capacity. Troops are all infantry. |
| **20** | **Milestone: can command 100 soldiers (a full century)** |
| 20+ | Each level: +5 **cavalry** added to the army (in addition to infantry) |
| Max | Up to 200 troops: 100 infantry + 100 cavalry |

### Skill Awakening (觉醒)
When leveling up, generals may **awaken** new skills:
- New **武将技 (general combat skills)** unlock at certain level thresholds
- New **军师技 (strategist skills)** also unlock via leveling
- Each general has a **unique skill progression path** — not all generals learn the same skills
- This means a level 30 Guan Yu has fundamentally different capabilities than a level 30 Zhuge Liang

### Equipment System
Generals can equip items in four slots:

#### Weapons (武器) — 50+ types
| Tier | Example | Attack Bonus |
|------|---------|-------------|
| Low | 直剑 (Straight Sword) | +1 |
| Mid | 铁矛 (Iron Spear) | +8-12 |
| High | 方天画戟 (Sky Piercer Halberd) | +25 |
| Legendary | 青龙偃月刀 (Green Dragon Crescent Blade) | +30 |

**Key:** Stronger weapons have **level requirements**. You cannot equip a legendary weapon on a low-level general. This creates a satisfying RPG progression.

#### Horses (坐骑)
| Horse | Speed Bonus | Special |
|-------|------------|---------|
| Basic mounts | +1 to +5 | — |
| 的卢马 (Di Lu) | +5 | — |
| 赤兔马 (Red Hare) | +6 | Immune to forced retreat |

#### Books / Tomes (书籍) — Intelligence boosters
| Item | Intelligence Bonus |
|------|-------------------|
| 史记 (Records of the Grand Historian) | +7 |
| 春秋左传 (Zuo Commentary on Spring & Autumn) | +10 |
| 孙子兵法 (Art of War) | +20 |

#### Jewelry / Loyalty Items (珠宝)
| Item | Loyalty Bonus |
|------|--------------|
| 美女 (Beauties) | +8 |
| 黄金 (Gold) | +10 |
| 珠宝 (Jewels) | +12 |

Used to keep recruited enemy generals loyal. Without these, freshly recruited generals may defect back.

---

## 6. Military Officer Skills (武将技) — 110 Unique Skills

The skill system is the single most exciting feature of the game. There are **110 distinct 武将技** organized into categories.

### Skill Categories

#### Healing / Support
| # | Name | Description |
|---|------|-------------|
| R001 | 命疗术 (Life Healing) | Restores the general's HP |
| R060 | 回天术 (Heaven's Return) | Powerful HP restoration |

#### Ranged / Projectile Skills
| # | Name | Description |
|---|------|-------------|
| R002 | 落日弓 (Sunset Bow) — Scholar variant | Long-range arrow attack |
| R052 | 落日弓 (Sunset Bow) — Warrior variant | Long-range arrow attack (stronger) |
| R004 | 火箭 (Fire Arrow) | Flaming projectile barrage |
| R015 | 火箭烈 (Blazing Fire Arrow) | Enhanced fire arrow storm |
| R030 | 火箭天袭 (Heavenly Fire Arrow) | Ultimate fire arrow rain |
| R045 | 飞矢 (Flying Arrows) | Quick arrow volley |
| R046 | 连弩 (Repeating Crossbow) | Rapid-fire crossbow bolts |
| R062 | 连弩激射 (Crossbow Barrage) | Intense crossbow volley |
| R013 | 御飞刀 (Imperial Flying Daggers) | Thrown blade attack |

#### Melee / Close Combat Skills
| # | Name | Description |
|---|------|-------------|
| R049 | 刀剑乱 (Blade Storm) | Wild slashing attack hitting nearby enemies |
| R050 | 半月斩 (Crescent Slash) | Arc-shaped melee cleave |
| R051 | 旋龙 (Spinning Dragon) | Spinning attack hitting all around |
| R059 | 鬼戟 (Ghost Halberd) | Powerful single-target melee strike |
| R104 | 神鬼乱舞 (Divine Ghost Dance) | Ultimate melee combo — freezes enemy in place while dealing massive damage. Best single-combat skill in the game. |

#### Area-of-Effect / Elemental Attacks
| # | Name | Description |
|---|------|-------------|
| R003 | 地泉冲 (Earth Spring Surge) | Ground eruption damaging a line of enemies |
| R018 | 地泉列劲 (Earth Spring Wave) | Wider ground eruption |
| R026 | 地泉鲸浪 (Earth Spring Whale Wave) | Massive ground AoE |
| R007 | 虎咆 (Tiger Roar) | Shockwave damaging nearby enemies |
| R016 | 虎咆震 (Tiger Quake) | Stronger shockwave |
| R023 | 虎咆阳炎 (Tiger Solar Blaze) | Ultimate tiger roar with fire |
| R008 | 火雷 (Fire Thunder) | Explosive attack |
| R024 | 火雷爆 (Fire Thunder Blast) | Enhanced explosive attack |
| R032 | 火雷星雨 (Fire Thunder Meteor) | Meteors raining on the battlefield |
| R009 | 雷击 (Lightning Strike) | Single lightning bolt |
| R028 | 雷击闪 (Lightning Flash) | Rapid chain lightning |
| R014 | 雷光波动 (Thunder Light Wave) | Expanding shockwave of lightning |
| R022 | 雷光振杀 (Thunder Light Execution) | Devastating lightning burst |
| R039 | 雷光焦狱 (Thunder Light Hell Prison) | Cage of lightning |
| R042 | 五雷轰顶 (Five Thunders Strike) | Five simultaneous lightning bolts from the sky |
| R043 | 狂雷天牢 (Raging Thunder Prison) | Ultimate lightning cage trapping enemies |

#### Fire / Dragon Skills
| # | Name | Description |
|---|------|-------------|
| R010 | 炎龙 (Fire Dragon) | Dragon of flame sweeps across the field |
| R021 | 炎龙无双 (Peerless Fire Dragon) | Larger fire dragon |
| R029 | 炎龙杀阵 (Fire Dragon Slaughter Formation) | Fire dragon hits an area |
| R033 | 炎龙怒涛 (Fire Dragon Fury Wave) | Cascading fire dragons |
| R041 | 炎龙绝杀 (Fire Dragon Execution) | Ultimate fire dragon devastation |
| R011 | 伏焰 (Hidden Flame) | Flame trap on the ground |
| R034 | 赤焰洪流 (Crimson Flame Flood) | Wall of fire |
| R036 | 赤焰火海 (Crimson Flame Sea) | Entire field engulfed |
| R053 | 八面火 (Eight-Direction Fire) | Fire radiating in all directions |
| R054 | 旋灯火 (Spinning Lantern Fire) | Rotating fire around the general, clears surrounding troops |

#### Trap / Summoning / Formation Skills
| # | Name | Description |
|---|------|-------------|
| R005 | 伏兵组阵 (Ambush Formation) | Summon hidden soldiers to attack |
| R017 | 伏兵排阵 (Ambush Array) | Larger ambush |
| R031 | 后伏兵阵 (Rear Ambush) | Ambush from behind |
| R037 | 后伏军阵 (Rear Army Ambush) | Massive rear ambush |
| R019 | 后伏连兵 (Linked Rear Ambush) | Chain of ambush soldiers |
| R040 | 十面埋伏 (Ambush from Ten Sides) | Ultimate ambush — enemies cannot flee even at 1 HP |
| R006 | 木轮攻 (Wooden Wheel Attack) | Rolling log/wheel obstacle |
| R020 | 木轮强袭 (Wooden Wheel Assault) | Larger rolling barrage |
| R035 | 木轮涛击 (Wooden Wheel Tidal Strike) | Wave of rolling wheels |
| R056 | 太极门 (Taiji Gate) | Defensive barrier formation |
| R058 | 八门金锁 (Eight Gates Golden Lock) | Imprisoning formation |

#### Siege / Special
| # | Name | Description |
|---|------|-------------|
| R047 | 突石 (Hurled Boulders) | Catapult-like stone barrage |
| R048 | 落石 (Falling Stones) | Stones drop from above |
| R055 | 突石剑 (Boulder Blade) | Combined stone+blade attack |
| R061 | 地茅刺 (Ground Spike) | Spikes erupt from earth |
| R063 | 冰柱刺 (Ice Pillar Stab) | Frozen spikes |
| R065 | 冲车 (Battering Ram) | Siege vehicle charges forward |
| R070 | 火牛阵 (Fire Ox Formation) | Flaming oxen charge the enemy line |
| R080 | 八卦奇阵 (Eight Trigrams Mystery Formation) | Complex tactical formation |
| R025 | 黄龙天翔 (Yellow Dragon Sky Flight) | Golden dragon soars across the field |

#### Ultimate / Top-Tier Skills
| # | Name | Description |
|---|------|-------------|
| R038 | 大地狂啸 (Earthshaking Howl) | Highest troop-clearing damage in the game. Wipes ~180 of 200 enemy soldiers. Requires enemies to be charging. |
| R044 | 天地无用 (Heaven and Earth Rendered Useless) | Ultimate scholar skill. Combines 黄龙天翔 + 火牛烈崩 + 狂雷天牢. Both clears troops AND damages the general. Available to: Zhuge Liang, Sima Yi, and 3 others. |
| R100 | 旋龙天舞 (Spinning Dragon Sky Dance) | Top-tier spinning AoE with massive range |
| R104 | 神鬼乱舞 (Divine Ghost Dance) | Best duel skill — locks the enemy in place while you pummel them |
| R110 | 鬼哭神号 (Ghostly Wailing, God's Cry) | **THE ultimate skill.** Combines: 分身斩 + 太极华阵 (x2) + 集火柱. Clears ALL troops AND devastates the enemy general. Only 4 generals possess it — the "四鬼" (Four Demons): **Guan Yu, Xiahou Dun, Taishi Ci, Lu Bu**. |

### Skill Usage in Battle
1. Battle begins. The general's **qi gauge (气力条)** starts empty.
2. As time passes and the general fights, the gauge fills.
3. When full, the player can trigger their 武将技.
4. The screen flashes, a dramatic animation plays (fire dragons, lightning, spinning blades, etc.)
5. Massive damage is dealt to enemies in the skill's area of effect.
6. The gauge resets and begins filling again.

**Strategic depth:** Different skills have different use cases. AoE skills like 大地狂啸 are best for clearing enemy soldiers. Single-target skills like 神鬼乱舞 are best for general duels. Healing skills like 回天术 extend your general's staying power. The choice of when to deploy which skill — and the general's level determining WHICH skills they even have — is the core of the game's strategy.

---

## 7. Strategist Skills (军师技) — 67 Unique Abilities

The army's designated strategist (军师) provides a **one-time tactical ability** that activates at the start of battle or provides a persistent buff.

### Key Strategist Skills
| Category | Skill | Effect |
|----------|-------|--------|
| **Healing** | 恢复体力 初/中/高 (Restore HP Low/Mid/High) | Heal general's HP by 20%/35%/50% |
| **Recovery** | 恢复技力 初/中/高 (Restore MP Low/Mid/High) | Restore skill energy |
| **Buff** | 增加体力 初/中/高 (Boost HP) | Increase max HP by 20%/35%/50% |
| **Buff** | 增加技力 (Boost MP) | Increase max skill energy |
| **Speed** | 快速集气 (Rapid Qi Charge) | General's qi gauge fills much faster — get skills off sooner |
| **Position** | 逼近敌军 (Close on Enemy) | All your troops immediately advance |
| **Position** | 保留气力 (Conserve Energy) | Start with partial qi gauge — crucial for ranged openers |
| **Disruption** | 偷袭敌军 (Ambush Attack) | Reverse enemy formation; -20 to formation matchup |
| **Disruption** | 封武将技 (Seal General Skill) | 33% chance to prevent enemy from using their skill. Devastating when it works. |
| **Control** | 十面埋伏 (Total Ambush) | Enemy cannot retreat even at 1 HP |
| **Utility** | 化解计策 (Counter Strategy) | If your strategist's intelligence >= enemy's, nullify their strategist skill |
| **Tactical** | 诈败 (Feigned Retreat) | General can retreat to the far edge of the battlefield, isolating enemy soldiers for easy picking |
| **Recruitment** | 劝降 (Persuade Surrender) | Attempt to recruit enemy soldiers mid-battle |
| **Intelligence** | 离间计 (Sow Discord) | Lower enemy general's loyalty, making post-battle recruitment more likely |

---

## 8. Army Types and Formations

### Unit Types (兵种) — 14 Types in 3 Categories

#### Short Weapons (短兵器) — Counter ranged units
| Unit | Description |
|------|-------------|
| **朴刀兵 (Broadsword Infantry)** | Standard melee. Fully counters archers and knife throwers. |
| **武斗兵 (Martial Artists)** | Fast melee fighters. Counter ranged. Do NOT gain cavalry at level 20+. |
| **蛮族兵 (Barbarian Warriors)** | Tribal fighters. Short-range melee. Statistically weakest overall. |
| **藤甲兵 (Rattan Armor Troops)** | Armored with vine shields. Excellent vs. ranged. (Historically: Meng Huo's southern tribes) |
| **女兵 (Female Warriors)** | Light melee fighters. Short-weapon class. |

#### Long Weapons (长兵器) — Counter short-weapon units
| Unit | Description |
|------|-------------|
| **长枪兵 (Spearmen)** | Reach advantage over short weapons. Classic frontline unit. |
| **大刀兵 (Great Sword Infantry)** | Heavy melee with sweeping attacks. |
| **链锤兵 (Chain Hammer Troops)** | Flail-wielding soldiers. |
| **铁锤兵 (Iron Hammer Troops)** | Heavy hammer units. Do NOT gain cavalry at level 20+. |

#### Ranged Units (远程兵) — Counter long-weapon units
| Unit | Description |
|------|-------------|
| **弓箭兵 (Archers)** | Standard ranged. Fully counter all long-weapon types. |
| **弩兵 (Crossbowmen)** | Stronger ranged with slower fire rate. |
| **飞刀兵 (Knife Throwers)** | Fast throwing attacks. Do NOT gain cavalry at level 20+. |

#### Special
| Unit | Description |
|------|-------------|
| **黄巾兵 (Yellow Turban Rebels)** | Weak all-around. Only available in early scenarios. |
| **义勇兵 (Militia/Volunteers)** | Basic levied soldiers. Weakest type. |

### The Rock-Paper-Scissors Counter System (兵种相克)
```
    SHORT WEAPONS (朴刀/武斗/藤甲/女兵/蛮兵)
          │
          │ counters
          ▼
    RANGED UNITS (弓箭/弩/飞刀)
          │
          │ counters
          ▼
    LONG WEAPONS (长枪/大刀/链锤/铁锤)
          │
          │ counters
          ▼
    SHORT WEAPONS (cycle repeats)
```

**Mnemonic (口诀):** "远克长，长克短，短兵又克远程兵" (Ranged beats Long, Long beats Short, Short beats Ranged)

### Cavalry Mechanic
- At level 20+, most unit types gain 5 cavalry per level
- Exception: 武斗兵, 铁锤兵, 飞刀兵 do NOT get cavalry
- Maximum: 100 infantry + 100 cavalry = 200 soldiers
- Cavalry are faster and deal more damage

### Formation System (阵型) — 9 Formations

Each general can deploy their troops in one of 9 formations. Formations must be **learned** by finding 阵型之书 (Formation Manuals) through the Search action in internal affairs.

| Formation | Shape | Class |
|-----------|-------|-------|
| **方形 (Square)** | Balanced block | Flat-head (平头) |
| **圆形 (Circle)** | Defensive ring | Flat-head (平头) |
| **鱼丽 (Fish Scale)** | Overlapping rows | Flat-head (平头) |
| **锥形 (Wedge/Cone)** | Arrow point forward | Sharp-head (尖头) |
| **箭矢 (Arrow)** | Arrow shape | Sharp-head (尖头) |
| **冲锋 (Charge)** | Aggressive spearhead | Sharp-head (尖头) |
| **雁形 (Wild Goose/V)** | V-formation, flanking | Concave-head (凹头) |
| **钩形 (Hook)** | Hooked flanking | Concave-head (凹头) |
| **玄襄 (Mystical)** | Special formation | (Unique — reportedly disrupts enemy coordination) |

### Formation Counter System
```
    FLAT-HEAD (方/圆/鱼丽)
         │
         │ counters
         ▼
    CONCAVE-HEAD (雁/钩)
         │
         │ counters
         ▼
    SHARP-HEAD (锥/箭/冲锋)
         │
         │ counters
         ▼
    FLAT-HEAD (cycle repeats)
```

**Mnemonic:** "平克凹，凹克尖，尖克平" (Flat beats Concave, Concave beats Sharp, Sharp beats Flat)

**Matchup bonuses** range from **+25 to -25** — a significant combat multiplier. Choosing the right formation against the enemy's is critical.

**Double layer of strategy:** You must consider BOTH unit type counters AND formation counters simultaneously. The ideal matchup has favorable unit types AND a favorable formation.

---

## 9. Visual Style and UI

### Art Direction
- **2D top-down** for the overworld map; **2D side-scrolling** for battles
- **Resolution:** 640x480 (original 1999 release), typical of late-90s PC games
- **Color palette:** Warm, earthy tones with splashes of vivid color for faction flags and skill effects
- **Character portraits:** Hand-drawn in a Chinese historical illustration style (工笔风). Each of the 400+ generals has a unique portrait showing their face, armor, and personality. Famous characters (Guan Yu, Cao Cao, Zhuge Liang) have particularly iconic portraits.

### Battle Visuals
- **Soldiers** are small 2D sprites that move, fight, and die on the horizontal battlefield
- **Generals** are larger sprites, clearly distinguishable from their troops
- **Skill animations** are the visual highlight: when a 武将技 is activated, the screen fills with dramatic effects:
  - Fire dragons sweep across the field (炎龙 series)
  - Lightning bolts crash from the sky (雷击 series)
  - Spinning wheels of fire surround the general (旋灯火)
  - Ghostly apparitions attack (鬼哭神号)
  - Ground erupts with spikes and geysers (地泉 series)
- In **high-color mode (高彩模式)**, the light and shadow effects on skills are described as "华丽眩目" (dazzling and gorgeous)
- The contrast between small, simple soldier sprites and MASSIVE, flashy skill effects is a core part of the visual thrill

### UI Layout
- **Overworld:** Map fills screen, with a sidebar showing city info, army lists, and commands
- **Battle:** Horizontal battlefield with general HP/MP bars at top, formation displayed, command buttons at bottom
- **Internal Affairs:** City-centric panel with buttons for Search/Develop/Auto-govern, general roster, and equipment management

---

## 10. What Makes It Addictive for Kids

Based on community analysis and the game's enduring popularity as a childhood classic (童年回忆), these are the specific hooks:

### 1. The "Power Fantasy" Skill Animations
When your general charges their qi gauge and unleashes a devastating 武将技, the screen explodes with fire dragons, lightning storms, or ghostly attacks. Enemies fly across the screen. The contrast between the small, patient buildup and the MASSIVE payoff is pure dopamine. Kids talk about "getting R110" (鬼哭神号) the way they talk about a final form transformation in anime.

### 2. General Collection / Recruitment
With **400 named historical generals**, the game is essentially a collector's dream. Every battle creates a "will I capture this famous general?" moment. The three-choice system (recruit/execute/release) creates genuine stakes. Kids develop personal rosters of favorites and trade tips on how to recruit specific famous characters.

### 3. Fast-Paced "Just One More Battle" Loop
Unlike turn-based strategy games that can feel slow, battles resolve in 1-3 minutes each. The game's "elimination format" means you might fight 3-5 duels in quick succession. The overworld moves in real-time, so there's always something about to happen. This creates a "just one more turn" / "just one more battle" compulsion loop.

### 4. The Leveling and Skill Unlock Treadmill
Generals gain XP, level up, and learn new (cooler!) skills. A general who starts with a basic 火箭 (Fire Arrow) eventually learns 炎龙绝杀 (Fire Dragon Execution). The progression is visible and exciting. Kids grind battles partly to see what awesome skill their favorite general will learn next.

### 5. Rock-Paper-Scissors Depth (Learnable but Not Trivial)
The unit-type and formation counter systems are simple enough for a child to understand ("short beats ranged!") but deep enough that mastering the double-layer of counters + formation matchups feels rewarding. Kids feel smart when they correctly predict the enemy's formation and counter it.

### 6. Famous Characters with Real Power Differences
Guan Yu is NOT just a portrait — he has 99 武力, learns 鬼哭神号, and is genuinely terrifying in battle. Lu Bu is the strongest fighter but you start as his enemy. The game respects the source material's power hierarchy, and kids who know the Three Kingdoms story feel rewarded when the game confirms "yes, Zhao Yun really is that good."

### 7. Territory Expansion on the Map
Watching your faction's colored flags spread across the map of China is deeply satisfying. The overworld map provides a god-like strategic perspective that makes you feel like a real warlord. Every city conquered is visible on the map.

### 8. Minimal Busywork, Maximum Action
The game deliberately strips away complex resource management, diplomacy trees, and technology research that bog down other strategy games. You search cities, develop them, and then get back to fighting. This focus on action over management perfectly suits a child's attention span.

### 9. The "Underdog" Fantasy
Starting with a small faction (like Liu Bei with just 2-3 cities) and conquering all of China is the ultimate power fantasy. The game makes this journey from nobody to emperor feel achievable because each battle is winnable with good tactics even when outnumbered.

### 10. Social / MOD Culture
The game's simplicity and moddability led to a thriving fan community creating custom scenarios, rebalanced versions, and fantasy crossover mods. Kids share tips, cheat codes (the famous DALL cheat code that enables god mode), and battle stories. This social layer extends the game's life dramatically.

---

## 11. Mechanics Adaptable to an Educational Coding Game

| Sango Heroes 2 Mechanic | Educational Adaptation Potential |
|--------------------------|--------------------------------------|
| **Qi gauge → skill activation** | Code correctness charges a "skill gauge." When your algorithm is correct, trigger a spectacular battle animation. Wrong code = gauge stalls. |
| **武将技 skill tiers** | Beginner coding concepts unlock basic skills (火箭); advanced concepts unlock powerful skills (鬼哭神号). Visual escalation motivates learning. |
| **General leveling / XP** | Solving problems earns XP for your general. Level up to unlock new skills and stronger troop types. |
| **Rock-paper-scissors unit counters** | Choose your "data structure" or "algorithm approach" like choosing a unit type. The right choice for the problem gives you an advantage. |
| **Formation selection** | Choose your code architecture / approach before the "battle" (coding challenge). Good design = formation advantage. |
| **Recruitment post-battle** | After completing a chapter, "recruit" a new Three Kingdoms general to your roster. Each general represents a new programming concept or tool. |
| **General collection (400 characters)** | Collectible general cards unlocked through progress. Each card shows historical info + the programming concept they represent. |
| **Territory expansion on map** | The overworld map shows your progress across China. Each city = a chapter or concept mastered. Watching your territory grow = watching your knowledge grow. |
| **Elimination-format multi-battle** | Multi-part coding challenges where each sub-problem is a "general" you must defeat. Win all sub-problems to conquer the city. |
| **Equipment / weapons** | Unlock coding "tools" (debugger = better weapon, linter = better armor, etc.) that make future challenges easier. |
| **Strategist skills** | "Hints" or "assists" framed as strategist skills. Using 快速集气 = getting a hint to speed up your solution. Using 化解计策 = the debugger catching an error. |
| **The duel moment** | Boss battles are 1v1 duels against famous enemy generals. The coding challenge is harder, but the visual payoff (watching your general fight a named enemy) is proportionally grander. |
| **Historical scenario selection** | Choose which "era" to play = choose which difficulty/topic track to follow. Earlier eras are easier with more varied problems; later eras are harder but more focused. |

---

## 12. Summary of Key Numbers

| Metric | Value |
|--------|-------|
| Total named generals | ~400 |
| General combat skills (武将技) | 110 |
| Strategist skills (军师技) | 67 |
| Unit types (兵种) | 14 |
| Formations (阵型) | 9 |
| Weapons | 50+ |
| Historical scenarios | 5 |
| Max army size per general | 200 (100 infantry + 100 cavalry) |
| Max generals per army | 5 |
| Year span | 185-280 CE (~95 years) |

---

## Sources

- [三国群英传II — 百度百科](https://baike.baidu.com/item/%E4%B8%89%E5%9B%BD%E7%BE%A4%E8%8B%B1%E4%BC%A0%E2%85%A1/3973429)
- [三国群英传2 武将技秘技 — 游民星空](https://www.gamersky.com/handbook/200901/133611.shtml)
- [三国群英传2 兵种全面分析 — 忆三国游戏网](https://www.esanguo.com/gonglve/3768.html)
- [三国群英传2 兵种相克和阵型相克表 — 3DM](https://www.3dmgame.com/gl/3705571.html)
- [三国群英传2 阵型克制关系 — 小米游戏中心](https://game.xiaomi.com/viewpoint/1127866428_1588940823817_16)
- [三国群英传2 兵种和阵型相克表 — sanguogame.com.cn](https://www.sanguogame.com.cn/sgqyz2/gl/5215.html)
- [三国群英传2 秘籍大全 — 知乎](https://zhuanlan.zhihu.com/p/380933284)
- [三国群英传2 最强武将技分析 — 网易](https://c.m.163.com/news/a/HDPIL8QR0546O9E5.html)
- [三国群英传2 系列最佳分析 — 网易](https://www.163.com/dy/article/JJN3R58U0546O9E5.html)
- [三国群英传2 军师技详解 — 3DM](https://www.3dmgame.com/gl/3770545.html)
- [三国群英传2 军师计详解及最强军师排名 — 忆三国](http://www.esanguo.com/gonglve/3770.html)
- [三国群英传2 Steam攻略指南](https://steamcommunity.com/sharedfiles/filedetails/?id=2286340542)
- [三国群英传2 Steam攻略心得](https://steamcommunity.com/sharedfiles/filedetails/?id=3396741291)
- [三国群英传 从1到7哪个最经典 — 知乎](https://www.zhihu.com/question/29522718)
- [三国群英传2 武器马匹道具全图鉴 — 忆三国](http://www.esanguo.com/gonglve/3765.html)
- [三国群英传2 宝物兵符军师技数据 — sanguogame.com.cn](https://www.sanguogame.com.cn/sgqyz2/gl/1927.html)
- [Heroes of the Three Kingdoms 2 — Steam](https://store.steampowered.com/app/1437830/Heroes_of_the_Three_Kingdoms_2/)
- [三国群英传2 原版400名武将属性速查 — 我爱秘籍](http://m.53miji.com/contents/201507/28801.html)
