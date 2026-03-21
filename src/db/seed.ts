/**
 * Seed script for 卧龙学堂 (Sleeping Dragon Academy)
 *
 * Run with: npx tsx src/db/seed.ts
 *
 * Populates the database with:
 * - 17 Generals (武将) from Three Kingdoms
 * - 20 Chapters (关卡) — 16 main + 4 side quests
 * - 12 Items (道具) — weapons, mounts, books, pouches
 * - 10 Achievements (成就)
 */

import { db } from "./index";
import { generals, chapters, items, achievements } from "./schema";

// ---------------------------------------------------------------------------
// Seed Data
// ---------------------------------------------------------------------------

const generalsData: (typeof generals.$inferInsert)[] = [
  // ── Shu (蜀) ──────────────────────────────────────────────────────────────
  {
    id: "liu-bei",
    name: "刘备",
    faction: "shu",
    traits: "仁",
    skillName: "双股剑法",
    imageUrl: "/generals/liu-bei.png",
  },
  {
    id: "guan-yu",
    name: "关羽",
    faction: "shu",
    traits: "义",
    skillName: "青龙偃月斩",
    imageUrl: "/generals/guan-yu.png",
  },
  {
    id: "zhang-fei",
    name: "张飞",
    faction: "shu",
    traits: "勇",
    skillName: "丈八蛇矛",
    imageUrl: "/generals/zhang-fei.png",
  },
  {
    id: "zhuge-liang",
    name: "诸葛亮",
    faction: "shu",
    traits: "智",
    skillName: "天地无用",
    imageUrl: "/generals/zhuge-liang.png",
  },
  {
    id: "zhao-yun",
    name: "赵云",
    faction: "shu",
    traits: "忠勇",
    skillName: "七进七出",
    imageUrl: "/generals/zhao-yun.png",
  },
  {
    id: "ma-chao",
    name: "马超",
    faction: "shu",
    traits: "烈",
    skillName: "虎头湛金枪",
    imageUrl: "/generals/ma-chao.png",
  },
  {
    id: "huang-zhong",
    name: "黄忠",
    faction: "shu",
    traits: "老当益壮",
    skillName: "百步穿杨",
    imageUrl: "/generals/huang-zhong.png",
  },
  {
    id: "jiang-wei",
    name: "姜维",
    faction: "shu",
    traits: "继承",
    skillName: "九伐中原",
    imageUrl: "/generals/jiang-wei.png",
  },

  // ── Wei (魏) ──────────────────────────────────────────────────────────────
  {
    id: "cao-cao",
    name: "曹操",
    faction: "wei",
    traits: "雄",
    skillName: "倚天剑法",
    imageUrl: "/generals/cao-cao.png",
  },
  {
    id: "sima-yi",
    name: "司马懿",
    faction: "wei",
    traits: "忍",
    skillName: "鹰视狼顾",
    imageUrl: "/generals/sima-yi.png",
  },

  // ── Wu (吴) ──────────────────────────────────────────────────────────────
  {
    id: "sun-quan",
    name: "孙权",
    faction: "wu",
    traits: "衡",
    skillName: "碧眼紫髯",
    imageUrl: "/generals/sun-quan.png",
  },
  {
    id: "zhou-yu",
    name: "周瑜",
    faction: "wu",
    traits: "才",
    skillName: "火烧赤壁",
    imageUrl: "/generals/zhou-yu.png",
  },
  {
    id: "lu-su",
    name: "鲁肃",
    faction: "wu",
    traits: "诚",
    skillName: "联盟之策",
    imageUrl: "/generals/lu-su.png",
  },
  {
    id: "huang-gai",
    name: "黄盖",
    faction: "wu",
    traits: "忠",
    skillName: "苦肉计",
    imageUrl: "/generals/huang-gai.png",
  },

  // ── Other (其他) ─────────────────────────────────────────────────────────
  {
    id: "lu-bu",
    name: "吕布",
    faction: "other",
    traits: "武",
    skillName: "鬼哭神号",
    imageUrl: "/generals/lu-bu.png",
  },
  {
    id: "diao-chan",
    name: "貂蝉",
    faction: "other",
    traits: "美智",
    skillName: "连环计",
    imageUrl: "/generals/diao-chan.png",
  },
  {
    id: "meng-huo",
    name: "孟获",
    faction: "other",
    traits: "蛮勇",
    skillName: "南蛮之力",
    imageUrl: "/generals/meng-huo.png",
  },
];

const chaptersData: (typeof chapters.$inferInsert)[] = [
  // ── Act I: 群雄并起 (The Heroes Gather) ────────────────────────────────
  {
    id: "ch-00",
    act: 1,
    title: "桃园三结义",
    storyArc: "刘备、关羽、张飞在桃园结义，誓同生死。",
    pythonConcept: "print()",
    difficulty: 1,
  },
  {
    id: "ch-01",
    act: 1,
    title: "温酒斩华雄",
    storyArc: "关羽温酒未凉之际，已斩华雄而归。",
    pythonConcept: "变量与字符串",
    difficulty: 1,
  },
  {
    id: "ch-02",
    act: 1,
    title: "三英战吕布",
    storyArc: "刘关张三兄弟合力对战天下第一武将吕布。",
    pythonConcept: "函数 (functions)",
    difficulty: 2,
  },
  {
    id: "ch-03",
    act: 1,
    title: "连环计",
    storyArc: "王允巧施连环计，貂蝉离间董卓与吕布。",
    pythonConcept: "条件判断 (if/else)",
    difficulty: 2,
  },
  {
    id: "ch-04",
    act: 1,
    title: "官渡之战",
    storyArc: "曹操以少胜多，奇袭乌巢粮仓，大破袁绍。",
    pythonConcept: "列表 (lists)",
    difficulty: 2,
  },
  {
    id: "ch-05",
    act: 1,
    title: "过五关斩六将",
    storyArc: "关羽千里走单骑，过五关斩六将，回归刘备。",
    pythonConcept: "for 循环",
    difficulty: 3,
  },

  // ── Act II: 卧龙出山 (The Dragon Awakens) ──────────────────────────────
  {
    id: "ch-06",
    act: 2,
    title: "三顾茅庐",
    storyArc: "刘备三次拜访隆中，终得诸葛亮出山辅佐。",
    pythonConcept: "while 循环",
    difficulty: 3,
  },
  {
    id: "ch-07",
    act: 2,
    title: "舌战群儒",
    storyArc: "诸葛亮只身赴东吴，舌辩群臣，促成孙刘联盟。",
    pythonConcept: "调试 (debugging)",
    difficulty: 3,
  },
  {
    id: "ch-08",
    act: 2,
    title: "草船借箭",
    storyArc: "诸葛亮用草船借箭，三日内得箭十万余支。",
    pythonConcept: "列表操作",
    difficulty: 3,
  },
  {
    id: "ch-09",
    act: 2,
    title: "赤壁之战",
    storyArc: "孙刘联军火烧赤壁，大破曹操八十万大军。",
    pythonConcept: "综合运用",
    difficulty: 4,
  },

  // ── Act III: 五虎上将 (The Five Tiger Generals) ────────────────────────
  {
    id: "ch-10",
    act: 3,
    title: "长坂坡",
    storyArc: "赵云单骑救主，七进七出曹营百万军中。",
    pythonConcept: "搜索算法",
    difficulty: 4,
  },
  {
    id: "ch-11",
    act: 3,
    title: "单刀赴会",
    storyArc: "关羽只身赴东吴宴会，凭胆识全身而退。",
    pythonConcept: "栈 (stack)",
    difficulty: 4,
  },
  {
    id: "ch-12",
    act: 3,
    title: "水淹七军",
    storyArc: "关羽利用地形水势，水淹于禁七军。",
    pythonConcept: "队列与排序",
    difficulty: 4,
  },

  // ── Act IV: 鞠躬尽瘁 (The Sleeping Dragon's Legacy) ───────────────────
  {
    id: "ch-13",
    act: 4,
    title: "七擒孟获",
    storyArc: "诸葛亮七擒七纵孟获，以德服人，平定南方。",
    pythonConcept: "while + 字典 (dict)",
    difficulty: 4,
  },
  {
    id: "ch-14",
    act: 4,
    title: "空城计",
    storyArc: "诸葛亮空城退敌，一人一琴吓退司马懿十五万大军。",
    pythonConcept: "封装 (encapsulation)",
    difficulty: 5,
  },
  {
    id: "ch-15",
    act: 4,
    title: "木牛流马",
    storyArc: "诸葛亮发明木牛流马，解决北伐粮草运输难题。",
    pythonConcept: "自定义数据结构",
    difficulty: 5,
  },

  // ── Side Quests (支线任务) ──────────────────────────────────────────────
  {
    id: "side-01",
    act: 3,
    title: "刮骨疗毒",
    storyArc: "华佗为关羽刮骨疗毒，关羽饮酒弈棋，谈笑自若。",
    pythonConcept: "深层调试",
    difficulty: 3,
  },
  {
    id: "side-02",
    act: 4,
    title: "火烧连营",
    storyArc: "陆逊火烧刘备七百里连营，教训紧耦合的代价。",
    pythonConcept: "反模式与解耦",
    difficulty: 4,
  },
  {
    id: "side-03",
    act: 4,
    title: "八阵图",
    storyArc: "诸葛亮以石阵困陆逊，阵法变幻莫测。",
    pythonConcept: "二维数组与迷宫",
    difficulty: 5,
  },
  {
    id: "side-04",
    act: 4,
    title: "诸葛连弩工坊",
    storyArc: "亲手打造诸葛连弩，体验古代工程智慧。",
    pythonConcept: "数组与迭代器",
    difficulty: 4,
  },
];

const itemsData: (typeof items.$inferInsert)[] = [
  // ── Weapons (武器) ─────────────────────────────────────────────────────
  {
    id: "weapon-qinglong",
    name: "青龙偃月刀",
    type: "weapon",
    effect: "攻击力 +15，义气值 +10",
    imageUrl: "/items/qinglong-dao.png",
  },
  {
    id: "weapon-zhangba",
    name: "丈八蛇矛",
    type: "weapon",
    effect: "攻击力 +12，暴击率 +8%",
    imageUrl: "/items/zhangba-mao.png",
  },
  {
    id: "weapon-fangtian",
    name: "方天画戟",
    type: "weapon",
    effect: "攻击力 +20，需要武力值 90+",
    imageUrl: "/items/fangtian-ji.png",
  },

  // ── Mounts (坐骑) ─────────────────────────────────────────────────────
  {
    id: "mount-chitu",
    name: "赤兔马",
    type: "mount",
    effect: "速度 +20，日行千里",
    imageUrl: "/items/chitu-ma.png",
  },
  {
    id: "mount-dilu",
    name: "的卢马",
    type: "mount",
    effect: "速度 +15，危机时刻可跃檀溪",
    imageUrl: "/items/dilu-ma.png",
  },

  // ── Books (兵书) ──────────────────────────────────────────────────────
  {
    id: "book-sunzi",
    name: "孙子兵法",
    type: "book",
    effect: "智力 +15，解锁高级策略提示",
    imageUrl: "/items/sunzi-bingfa.png",
  },
  {
    id: "book-chushibiao",
    name: "出师表",
    type: "book",
    effect: "忠诚 +20，经验值获取 +10%",
    imageUrl: "/items/chushibiao.png",
  },
  {
    id: "book-longzhongdui",
    name: "隆中对",
    type: "book",
    effect: "智力 +10，解锁全局地图视野",
    imageUrl: "/items/longzhongdui.png",
  },

  // ── Pouches (锦囊) ────────────────────────────────────────────────────
  {
    id: "pouch-basic",
    name: "锦囊（初级）",
    type: "pouch",
    effect: "提供基础代码提示",
    imageUrl: "/items/pouch-basic.png",
  },
  {
    id: "pouch-mid",
    name: "锦囊（中级）",
    type: "pouch",
    effect: "提供进阶解题思路",
    imageUrl: "/items/pouch-mid.png",
  },
  {
    id: "pouch-advanced",
    name: "锦囊（高级）",
    type: "pouch",
    effect: "提供详细解法分析",
    imageUrl: "/items/pouch-advanced.png",
  },
  {
    id: "pouch-divine",
    name: "锦囊（神级）",
    type: "pouch",
    effect: "直接展示参考答案，附诸葛亮亲笔注释",
    imageUrl: "/items/pouch-divine.png",
  },
];

const achievementsData: (typeof achievements.$inferInsert)[] = [
  {
    id: "ach-peach-garden",
    name: "桃园之誓",
    description: "完成第0章「桃园三结义」",
    triggerCondition: "complete_chapter:ch-00",
  },
  {
    id: "ach-act1-clear",
    name: "初出茅庐",
    description: "通关第一幕全部章节",
    triggerCondition: "complete_act:1",
  },
  {
    id: "ach-red-cliffs",
    name: "赤壁大捷",
    description: "通关Boss关「赤壁之战」",
    triggerCondition: "complete_chapter:ch-09",
  },
  {
    id: "ach-five-tigers",
    name: "五虎上将",
    description: "收集全部蜀国武将",
    triggerCondition: "collect_all_faction:shu",
  },
  {
    id: "ach-three-kingdoms",
    name: "天下三分",
    description: "通关全部四幕主线章节",
    triggerCondition: "complete_all_acts",
  },
  {
    id: "ach-first-blood",
    name: "温酒斩华雄",
    description: "完成第一个编程挑战",
    triggerCondition: "complete_chapter:ch-01",
  },
  {
    id: "ach-seven-captures",
    name: "七擒七纵",
    description: "通关「七擒孟获」获得三星",
    triggerCondition: "three_star_chapter:ch-13",
  },
  {
    id: "ach-collector",
    name: "兵器收藏家",
    description: "收集所有武器类道具",
    triggerCondition: "collect_all_type:weapon",
  },
  {
    id: "ach-bookworm",
    name: "卧龙书童",
    description: "收集所有兵书",
    triggerCondition: "collect_all_type:book",
  },
  {
    id: "ach-perfect-act1",
    name: "百战百胜",
    description: "第一幕全部章节获得三星评价",
    triggerCondition: "three_star_act:1",
  },
];

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 开始播种数据 (Seeding database)...\n");

  try {
    // Seed generals
    console.log(`📌 插入 ${generalsData.length} 位武将...`);
    for (const general of generalsData) {
      await db.insert(generals).values(general).onConflictDoNothing();
    }
    console.log("   ✅ 武将数据插入完成\n");

    // Seed chapters
    console.log(`📌 插入 ${chaptersData.length} 个关卡...`);
    for (const chapter of chaptersData) {
      await db.insert(chapters).values(chapter).onConflictDoNothing();
    }
    console.log("   ✅ 关卡数据插入完成\n");

    // Seed items
    console.log(`📌 插入 ${itemsData.length} 件道具...`);
    for (const item of itemsData) {
      await db.insert(items).values(item).onConflictDoNothing();
    }
    console.log("   ✅ 道具数据插入完成\n");

    // Seed achievements
    console.log(`📌 插入 ${achievementsData.length} 个成就...`);
    for (const achievement of achievementsData) {
      await db.insert(achievements).values(achievement).onConflictDoNothing();
    }
    console.log("   ✅ 成就数据插入完成\n");

    console.log("🎉 数据播种完毕！(Seeding complete!)");
    console.log(
      `   武将: ${generalsData.length} | 关卡: ${chaptersData.length} | 道具: ${itemsData.length} | 成就: ${achievementsData.length}`
    );
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("POSTGRES_URL") ||
        error.message.includes("connection") ||
        error.message.includes("connect") ||
        error.message.includes("ECONNREFUSED"))
    ) {
      console.error(
        "\n❌ 数据库连接失败 (Database connection failed).\n" +
          "   请确保已设置 POSTGRES_URL 环境变量。\n" +
          "   Please ensure the POSTGRES_URL environment variable is set.\n" +
          "   Example: POSTGRES_URL=postgres://user:pass@host:5432/dbname npx tsx src/db/seed.ts\n"
      );
    } else {
      console.error("\n❌ 播种失败 (Seeding failed):", error);
    }
    process.exit(1);
  }
}

seed();
