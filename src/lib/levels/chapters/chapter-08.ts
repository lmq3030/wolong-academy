import type { Chapter } from '../types';

export const chapter08: Chapter = {
  id: 'chapter-08',
  act: 2,
  title: '草船借箭',
  storyIntro:
    '周瑜刁难诸葛亮，限他三天造十万支箭。诸葛亮用草船借箭，巧借曹军之箭。' +
    '每条草船收集箭矢，就像列表的append操作，一批批加入！',
  pythonConcept: '列表操作 append/len',
  difficulty: 4,
  interactionMode: 'mixed',
  challenges: [
    {
      id: 'ch08-c1',
      type: 'drag',
      prompt: '诸葛亮准备草船收集箭矢！将正确的代码拖入位置，创建空列表并添加第一船箭。',
      correctAnswer:
        'arrows = []\narrows.append("第一船箭")\nprint(arrows)',
      testCases: [
        {
          expectedOutput: "['第一船箭']\n",
          description: '应该输出包含第一船箭的列表',
        },
      ],
      hints: [
        'Python中用方括号[]创建空列表，用.append()添加元素',
        '列表用[]，不是()。添加元素用append，不是add或push',
        '正确答案是 arrows = [] 然后 arrows.append("第一船箭")',
      ],
      qiReward: 30,
      dragOptions: [
        {
          id: 'ch08-c1-opt1',
          code: 'arrows = []\narrows.append("第一船箭")\nprint(arrows)',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch08-c1-opt2',
          code: 'arrows = ()\narrows.add("第一船箭")\nprint(arrows)',
          isCorrect: false,
        },
        {
          id: 'ch08-c1-opt3',
          code: 'arrows = []\narrows.push("第一船箭")\nprint(arrows)',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'ch08-c2',
      type: 'fill_blank',
      prompt: '草船回来了！在空白处填入正确的函数，计算一共有几船箭。',
      codeTemplate:
        'boats = ["第一船", "第二船", "第三船"]\nprint("共" + str(___) + "船箭")',
      correctAnswer:
        'boats = ["第一船", "第二船", "第三船"]\nprint("共" + str(len(boats)) + "船箭")',
      testCases: [
        {
          expectedOutput: '共3船箭\n',
          description: '应该输出共3船箭',
        },
      ],
      hints: [
        '要计算列表中有多少个元素，Python有一个内置函数……',
        'len()是Python内置函数，用来获取列表长度。不是.len()也不是count()',
        '填入"len(boats)"——len()函数返回列表的元素个数',
      ],
      qiReward: 30,
      choices: ['len(boats)', 'boats.len()', 'count(boats)'],
    },
    {
      id: 'ch08-c3',
      type: 'fill_blank',
      prompt: '取出最后收集的箭！在空白处填入正确的方法名，取出列表最后一个元素。',
      codeTemplate:
        'arrows = ["铁箭", "火箭", "毒箭"]\nlast = arrows.___()\nprint("取出：" + last)',
      correctAnswer:
        'arrows = ["铁箭", "火箭", "毒箭"]\nlast = arrows.pop()\nprint("取出：" + last)',
      testCases: [
        {
          expectedOutput: '取出：毒箭\n',
          description: '应该取出并输出最后一个元素毒箭',
        },
      ],
      hints: [
        '列表有个方法可以取出并移除最后一个元素……',
        'pop()会取出最后一个元素，remove()需要指定值，delete不是列表方法',
        '填入"pop"——arrows.pop()取出并返回列表最后一个元素',
      ],
      qiReward: 40,
      choices: ['pop', 'remove', 'delete'],
    },
  ],
  battle: {
    playerGeneral: 'zhuge-liang',
    playerSkill: '草船借箭',
    bgScene: '/assets/scenes/red-cliffs.png',
  },
  rewards: {
    xp: 300,
    quote: '万事俱备，只欠东风',
  },
};
