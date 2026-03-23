import type { Chapter } from '../types';

export const chapter09: Chapter = {
  id: 'chapter-09',
  act: 2,
  title: '密信传书',
  storyIntro:
    '曹操截获了刘备阵营的密信，需要用字符串操作来解读和加密消息。' +
    '字符串拼接、求长度、切片取字——掌握这些技巧，才能破解军机密信！',
  pythonConcept: '字符串操作',
  difficulty: 4,
  interactionMode: 'mixed',
  challenges: [
    {
      id: 'ch09-c1',
      type: 'drag',
      prompt: '拼接密信！将正确的代码拖入位置，用字符串拼接组成完整的作战计划。',
      correctAnswer:
        'message = "火" + "攻" + "曹营"\nprint(message)',
      testCases: [
        {
          expectedOutput: '火攻曹营\n',
          description: '应该输出拼接后的字符串火攻曹营',
        },
      ],
      hints: [
        'Python中字符串用+号拼接，不是用减号或逗号',
        '字符串拼接用 "a" + "b" 的形式，逗号会产生不同的结果',
        '正确答案是 message = "火" + "攻" + "曹营"',
      ],
      qiReward: 30,
      dragOptions: [
        {
          id: 'ch09-c1-opt1',
          code: 'message = "火" + "攻" + "曹营"\nprint(message)',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch09-c1-opt2',
          code: 'message = "火" - "攻"\nprint(message)',
          isCorrect: false,
        },
        {
          id: 'ch09-c1-opt3',
          code: 'message = "火", "攻", "曹营"\nprint(message)',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'ch09-c2',
      type: 'fill_blank',
      prompt: '计算密信长度！在空白处填入正确的函数，获取密信的字符数。',
      codeTemplate:
        'secret = "借东风"\nprint("密信长度：" + str(___))',
      correctAnswer:
        'secret = "借东风"\nprint("密信长度：" + str(len(secret)))',
      testCases: [
        {
          expectedOutput: '密信长度：3\n',
          description: '应该输出密信长度3',
        },
      ],
      hints: [
        '要获取字符串的长度，和获取列表长度用的是同一个函数……',
        'len()是Python内置函数，对字符串也适用。不是.length属性也不是size()',
        '填入"len(secret)"——len()返回字符串的字符个数',
      ],
      qiReward: 30,
      choices: ['len(secret)', 'secret.length', 'size(secret)'],
    },
    {
      id: 'ch09-c3',
      type: 'fill_blank',
      prompt: '提取密信关键字！在空白处填入正确的索引，取出计策的第一个字。',
      codeTemplate:
        'plan = "火烧赤壁"\nfirst_char = plan[___]\nprint("计策第一字：" + first_char)',
      correctAnswer:
        'plan = "火烧赤壁"\nfirst_char = plan[0]\nprint("计策第一字：" + first_char)',
      testCases: [
        {
          expectedOutput: '计策第一字：火\n',
          description: '应该输出计策的第一个字火',
        },
      ],
      hints: [
        'Python中索引从几开始？第一个元素的索引是……',
        'Python索引从0开始，所以第一个字符的索引是0，不是1',
        '填入"0"——plan[0]取出字符串的第一个字符',
      ],
      qiReward: 40,
      choices: ['0', '1', '-1'],
    },
  ],
  battle: {
    playerGeneral: 'zhou-yu',
    playerSkill: '火攻',
    bgScene: '/assets/scenes/red-cliffs.png',
  },
  rewards: {
    xp: 300,
    quote: '既生瑜，何生亮',
  },
};
