import type { Chapter } from '../types';

export const chapter07: Chapter = {
  id: 'chapter-07',
  act: 2,
  title: '刮骨疗毒',
  storyIntro:
    '关羽攻打樊城时中了毒箭，华佗为他刮骨疗毒，关羽面不改色，谈笑弈棋。' +
    '找bug就像找毒一样——要仔细检查代码中的每一处"伤口"！',
  pythonConcept: '调试 Debug',
  difficulty: 3,
  interactionMode: 'fill',
  challenges: [
    {
      id: 'ch07-c1',
      type: 'fill_blank',
      prompt: '代码中有"毒"！变量名拼错了，找出正确的变量名来输出关羽的名字。',
      codeTemplate:
        'name = "关羽"\nprint(___)',
      correctAnswer:
        'name = "关羽"\nprint(name)',
      testCases: [
        {
          expectedOutput: '关羽\n',
          description: '应该正确输出关羽',
        },
      ],
      hints: [
        '第一行定义了一个变量，print里应该用同一个变量名……',
        '第一行写的是 name = "关羽"，所以变量名是name，不是nama',
        '填入"name"——和第一行定义的变量名完全一致',
      ],
      qiReward: 30,
      choices: ['name', 'nama', '"name"'],
    },
    {
      id: 'ch07-c2',
      type: 'fill_blank',
      prompt: '关羽的武器名少了引号！在空白处填入正确的字符串值。',
      codeTemplate:
        'weapon = ___\nprint(weapon)',
      correctAnswer:
        'weapon = "青龙偃月刀"\nprint(weapon)',
      testCases: [
        {
          expectedOutput: '青龙偃月刀\n',
          description: '应该输出青龙偃月刀',
        },
      ],
      hints: [
        '字符串需要用引号包起来，不然Python会当成变量名……',
        'Python中字符串必须有引号，比如"你好"是字符串，而你好会报错',
        '填入 "青龙偃月刀"——带双引号的才是正确的字符串',
      ],
      qiReward: 30,
      choices: ['"青龙偃月刀"', '青龙偃月刀', 'weapon'],
    },
    {
      id: 'ch07-c3',
      type: 'fill_blank',
      prompt: '华佗需要判断关羽是否需要治疗！在空白处填入正确的比较运算符。',
      codeTemplate:
        'health = 50\nif health ___ 100:\n    print("需要治疗！")',
      correctAnswer:
        'health = 50\nif health < 100:\n    print("需要治疗！")',
      testCases: [
        {
          expectedOutput: '需要治疗！\n',
          description: '血量50小于100，应该输出需要治疗',
        },
      ],
      hints: [
        '关羽现在血量50，满血是100，50和100之间是什么关系？',
        '50比100小，我们需要"小于"这个比较运算符',
        '填入"<"——50 < 100 为True，所以会执行print',
      ],
      qiReward: 40,
      choices: ['<', '>', '=='],
    },
  ],
  battle: {
    playerGeneral: 'guan-yu',
    playerSkill: '刮骨疗毒',
    bgScene: '/assets/scenes/military-camp.png',
  },
  rewards: {
    xp: 250,
    unlockGenerals: ['zhuge-liang'],
    quote: '刮骨疗毒，谈笑自若',
  },
};
