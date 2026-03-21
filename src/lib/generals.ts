/**
 * Static generals data for the collection gallery.
 *
 * Extracted from src/db/seed.ts with additional character details
 * (title, weapon, quote) sourced from three-kingdoms-research.md.
 *
 * No DB dependency — this is a self-contained module for the MVP.
 */

export type Faction = 'shu' | 'wei' | 'wu' | 'other';

export interface General {
  id: string;
  name: string;
  faction: Faction;
  traits: string;
  skillName: string;
  title?: string;
  weapon?: string;
  quote?: string;
}

export const generals: General[] = [
  // ── Shu (蜀) ────────────────────────────────────────────────────────────
  {
    id: 'liu-bei',
    name: '刘备',
    faction: 'shu',
    traits: '仁',
    skillName: '双股剑法',
    title: '刘皇叔',
    weapon: '双股剑',
    quote: '不求同年同月同日生，但求同年同月同日死',
  },
  {
    id: 'guan-yu',
    name: '关羽',
    faction: 'shu',
    traits: '义',
    skillName: '青龙偃月斩',
    title: '武圣',
    weapon: '青龙偃月刀',
    quote: '身在曹营心在汉',
  },
  {
    id: 'zhang-fei',
    name: '张飞',
    faction: 'shu',
    traits: '勇',
    skillName: '丈八蛇矛',
    title: '张翼德',
    weapon: '丈八蛇矛',
    quote: '燕人张翼德在此！谁敢来决死战！',
  },
  {
    id: 'zhuge-liang',
    name: '诸葛亮',
    faction: 'shu',
    traits: '智',
    skillName: '天地无用',
    title: '卧龙',
    weapon: '羽扇',
    quote: '鞠躬尽瘁，死而后已',
  },
  {
    id: 'zhao-yun',
    name: '赵云',
    faction: 'shu',
    traits: '忠勇',
    skillName: '七进七出',
    title: '常山赵子龙',
    weapon: '亮银枪',
    quote: '吾乃常山赵子龙也！',
  },
  {
    id: 'ma-chao',
    name: '马超',
    faction: 'shu',
    traits: '烈',
    skillName: '虎头湛金枪',
    title: '锦马超',
    weapon: '虎头湛金枪',
  },
  {
    id: 'huang-zhong',
    name: '黄忠',
    faction: 'shu',
    traits: '老当益壮',
    skillName: '百步穿杨',
    weapon: '大刀与弓箭',
  },
  {
    id: 'jiang-wei',
    name: '姜维',
    faction: 'shu',
    traits: '继承',
    skillName: '九伐中原',
    title: '伯约',
  },

  // ── Wei (魏) ────────────────────────────────────────────────────────────
  {
    id: 'cao-cao',
    name: '曹操',
    faction: 'wei',
    traits: '雄',
    skillName: '倚天剑法',
    title: '治世之能臣，乱世之奸雄',
    weapon: '倚天剑',
    quote: '宁教我负天下人，休教天下人负我',
  },
  {
    id: 'sima-yi',
    name: '司马懿',
    faction: 'wei',
    traits: '忍',
    skillName: '鹰视狼顾',
    title: '冢虎',
  },

  // ── Wu (吴) ─────────────────────────────────────────────────────────────
  {
    id: 'sun-quan',
    name: '孙权',
    faction: 'wu',
    traits: '衡',
    skillName: '碧眼紫髯',
    title: '碧眼儿',
    quote: '生子当如孙仲谋',
  },
  {
    id: 'zhou-yu',
    name: '周瑜',
    faction: 'wu',
    traits: '才',
    skillName: '火烧赤壁',
    title: '美周郎',
    quote: '既生瑜，何生亮',
  },
  {
    id: 'lu-su',
    name: '鲁肃',
    faction: 'wu',
    traits: '诚',
    skillName: '联盟之策',
  },
  {
    id: 'huang-gai',
    name: '黄盖',
    faction: 'wu',
    traits: '忠',
    skillName: '苦肉计',
    quote: '周瑜打黄盖——一个愿打，一个愿挨',
  },

  // ── Other (其他) ────────────────────────────────────────────────────────
  {
    id: 'lu-bu',
    name: '吕布',
    faction: 'other',
    traits: '武',
    skillName: '鬼哭神号',
    title: '飞将',
    weapon: '方天画戟',
    quote: '人中吕布，马中赤兔',
  },
  {
    id: 'diao-chan',
    name: '貂蝉',
    faction: 'other',
    traits: '美智',
    skillName: '连环计',
    title: '四大美人',
  },
  {
    id: 'meng-huo',
    name: '孟获',
    faction: 'other',
    traits: '蛮勇',
    skillName: '南蛮之力',
    title: '南蛮王',
    quote: '攻心为上，攻城为下',
  },
];

export function getGeneralById(id: string): General | undefined {
  return generals.find((g) => g.id === id);
}

/** Return generals grouped by faction in display order. */
export function getGeneralsByFaction(): Record<Faction, General[]> {
  const groups: Record<Faction, General[]> = {
    shu: [],
    wei: [],
    wu: [],
    other: [],
  };
  for (const g of generals) {
    groups[g.faction].push(g);
  }
  return groups;
}

/** Faction metadata for display. */
export const factionMeta: Record<
  Faction,
  { label: string; color: string; bgLight: string; border: string; text: string }
> = {
  shu: {
    label: '蜀汉',
    color: 'var(--color-shu-red)',
    bgLight: 'bg-shu-red/10',
    border: 'border-shu-red',
    text: 'text-shu-red',
  },
  wei: {
    label: '曹魏',
    color: 'var(--color-wei-blue)',
    bgLight: 'bg-wei-blue/10',
    border: 'border-wei-blue',
    text: 'text-wei-blue',
  },
  wu: {
    label: '东吴',
    color: 'var(--color-wu-green)',
    bgLight: 'bg-wu-green/10',
    border: 'border-wu-green',
    text: 'text-wu-green',
  },
  other: {
    label: '其他',
    color: 'var(--color-bamboo)',
    bgLight: 'bg-bamboo/10',
    border: 'border-bamboo',
    text: 'text-bamboo',
  },
};
