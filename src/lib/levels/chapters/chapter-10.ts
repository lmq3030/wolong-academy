import type { Chapter } from '../types';

export const chapter10: Chapter = {
  id: 'chapter-10',
  act: 3,
  title: '长坂坡',
  storyIntro:
    '赵云在百万曹军中搜寻幼主阿斗。战场混乱，敌我难分，' +
    '必须逐一搜查每一个人。用循环和条件来搜索列表！',
  pythonConcept: '搜索算法 - for + if 组合',
  difficulty: 4,
  interactionMode: 'mixed',
  challenges: [
    {
      id: 'ch10-c1',
      type: 'fill_blank',
      prompt: '赵云在曹军中逐一搜查，找到阿斗！在空白处填入正确的搜索目标。',
      codeTemplate:
        'army = ["曹兵", "曹兵", "阿斗", "曹兵"]\nfor person in army:\n    if person == "___":\n        print("找到阿斗！")',
      correctAnswer:
        'army = ["曹兵", "曹兵", "阿斗", "曹兵"]\nfor person in army:\n    if person == "阿斗":\n        print("找到阿斗！")',
      testCases: [
        {
          expectedOutput: '找到阿斗！\n',
          description: '应该在列表中找到阿斗并输出',
        },
      ],
      hints: [
        '赵云在找谁？想想他冒死要救的人是谁。',
        '我们要和列表中的元素比较，找的是"阿斗"',
        '填入"阿斗"——person == "阿斗"就能匹配到目标',
      ],
      qiReward: 30,
      choices: ['阿斗', '曹兵', '赵云'],
    },
    {
      id: 'ch10-c2',
      type: 'fill_blank',
      prompt: '赵云不仅要找到阿斗，还要知道他在哪个位置！用enumerate获取索引。',
      codeTemplate:
        'army = ["曹兵", "阿斗", "曹兵"]\nfor i, person in ___:\n    if person == "阿斗":\n        print("阿斗在第" + str(i) + "个位置")',
      correctAnswer:
        'army = ["曹兵", "阿斗", "曹兵"]\nfor i, person in enumerate(army):\n    if person == "阿斗":\n        print("阿斗在第" + str(i) + "个位置")',
      testCases: [
        {
          expectedOutput: '阿斗在第1个位置\n',
          description: '应该输出阿斗所在的索引位置',
        },
      ],
      hints: [
        '要同时获取索引和元素，Python有一个内置函数可以做到。',
        'enumerate()可以在遍历时同时给出索引i和元素值',
        '填入"enumerate(army)"——它会返回(索引, 元素)的配对',
      ],
      qiReward: 30,
      choices: ['enumerate(army)', 'range(army)', 'len(army)'],
    },
    {
      id: 'ch10-c3',
      type: 'fill_blank',
      prompt: '找到阿斗后立刻突围！用搜索提前退出，不必继续检查剩余的人。',
      codeTemplate:
        'soldiers = ["张辽", "许褚", "阿斗", "夏侯惇"]\nfound = False\nfor s in soldiers:\n    if s == "阿斗":\n        found = True\n        ___\nprint("找到了！" if found else "没找到")',
      correctAnswer:
        'soldiers = ["张辽", "许褚", "阿斗", "夏侯惇"]\nfound = False\nfor s in soldiers:\n    if s == "阿斗":\n        found = True\n        break\nprint("找到了！" if found else "没找到")',
      testCases: [
        {
          expectedOutput: '找到了！\n',
          description: '应该找到阿斗并提前退出循环',
        },
      ],
      hints: [
        '找到阿斗后，赵云会继续搜查吗？应该立刻离开！',
        '有一个关键字可以立即跳出for循环，不再继续执行',
        '填入"break"——找到目标后立刻终止循环',
      ],
      qiReward: 40,
      choices: ['break', 'continue', 'return'],
    },
  ],
  battle: {
    playerGeneral: 'zhao-yun',
    playerSkill: '赵云长坂坡',
    bgScene: '/assets/scenes/military-camp.png',
  },
  rewards: {
    xp: 350,
    quote: '子龙一身都是胆',
  },
};
