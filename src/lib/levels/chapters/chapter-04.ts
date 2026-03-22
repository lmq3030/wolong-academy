import type { Chapter } from '../types';

export const chapter04: Chapter = {
  id: 'chapter-04',
  act: 1,
  title: '官渡之战',
  storyIntro:
    '曹操要夜袭乌巢，烧毁袁绍的粮草！粮仓里的物资就像一个列表，' +
    '我们要学会创建和操作列表。',
  pythonConcept: '列表（List）基础',
  difficulty: 3,
  interactionMode: 'fill',
  challenges: [
    {
      id: 'ch04-c1',
      type: 'fill_blank',
      prompt: '清点粮仓物资！在空白处填入正确的物资名称，完成粮仓清单。',
      codeTemplate:
        'supplies = ["粮草", "___", "帐篷"]\nprint(supplies)',
      correctAnswer:
        'supplies = ["粮草", "兵器", "帐篷"]\nprint(supplies)',
      testCases: [
        {
          expectedOutput: "['粮草', '兵器', '帐篷']\n",
          description: '应该输出完整的物资列表',
        },
      ],
      hints: [
        '粮仓里除了粮草和帐篷，还会有什么军需物资呢？',
        '打仗除了吃饭和住帐篷，还需要武器啊！',
        '填入"兵器"，完成物资清单',
      ],
      qiReward: 30,
      choices: ['兵器', 'supplies', '[]'],
    },
    {
      id: 'ch04-c2',
      type: 'fill_blank',
      prompt: '发现更多物资！用列表方法添加新物资，在空白处填入正确的方法名。',
      codeTemplate:
        'supplies = ["粮草", "兵器", "帐篷"]\nsupplies.___("战马")\nprint(len(supplies))',
      correctAnswer:
        'supplies = ["粮草", "兵器", "帐篷"]\nsupplies.append("战马")\nprint(len(supplies))',
      testCases: [
        {
          expectedOutput: '4\n',
          description: '应该输出4（列表长度）',
        },
      ],
      hints: [
        '想要往列表末尾添加一个元素，应该用什么方法？',
        'Python列表添加元素的方法叫append，意思是"追加"',
        '填入"append"——列表的追加方法',
      ],
      qiReward: 30,
      choices: ['append', 'add', 'push'],
    },
    {
      id: 'ch04-c3',
      type: 'fill_blank',
      prompt: '烧毁所有粮草！用for循环遍历粮仓，在空白处填入正确的变量名。',
      codeTemplate:
        'supplies = ["粮草", "兵器", "帐篷", "战马"]\nfor ___ in supplies:\n    print("烧毁：" + item)',
      correctAnswer:
        'supplies = ["粮草", "兵器", "帐篷", "战马"]\nfor item in supplies:\n    print("烧毁：" + item)',
      testCases: [
        {
          expectedOutput: '烧毁：粮草\n烧毁：兵器\n烧毁：帐篷\n烧毁：战马\n',
          description: '应该逐一烧毁所有物资',
        },
      ],
      hints: [
        'for循环中，每次取出的元素需要一个名字，看看print里用的是什么？',
        'print里用了item这个变量，所以for后面也应该用item',
        '填入"item"——让循环变量和print里的变量名一致',
      ],
      qiReward: 40,
      choices: ['item', 'supplies', 'i'],
    },
  ],
  battle: {
    playerGeneral: 'guan-yu',
    playerSkill: '十面埋伏',
    bgScene: '/assets/scenes/guandu-raid.png',
  },
  rewards: {
    xp: 250,
    unlockGenerals: ['cao-cao'],
    quote: '兵者，诡道也',
  },
};
