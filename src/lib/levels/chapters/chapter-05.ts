import type { Chapter } from '../types';

export const chapter05: Chapter = {
  id: 'chapter-05',
  act: 1,
  title: '过五关斩六将',
  storyIntro:
    '关羽得知刘备下落，带着嫂嫂千里走单骑。一路上要过五道关卡，斩六员大将。' +
    '每过一关，就像for循环执行一次！',
  pythonConcept: 'for 循环与 range()',
  difficulty: 4,
  interactionMode: 'fill',
  challenges: [
    {
      id: 'ch05-c1',
      type: 'fill_blank',
      prompt: '过五关！在空白处填入正确的数字，让关羽连过五道关卡。',
      codeTemplate:
        'for i in range(___):\n    print("过第" + str(i + 1) + "关！")',
      correctAnswer:
        'for i in range(5):\n    print("过第" + str(i + 1) + "关！")',
      testCases: [
        {
          expectedOutput: '过第1关！\n过第2关！\n过第3关！\n过第4关！\n过第5关！\n',
          description: '应该输出过五关',
        },
      ],
      hints: [
        '关羽要过几道关卡？数一数！',
        'range(n)会产生从0到n-1的数字，我们需要5个关卡',
        '填入"5"——range(5)会产生0,1,2,3,4五个数字',
      ],
      qiReward: 30,
      choices: ['5', '6', '3'],
    },
    {
      id: 'ch05-c2',
      type: 'fill_blank',
      prompt: '斩将！在空白处填入正确的变量名，让关羽逐一斩杀守关大将。',
      codeTemplate:
        'generals = ["孔秀", "韩福", "孟坦", "王植", "秦琪"]\nfor ___ in generals:\n    print("关羽斩了" + enemy)',
      correctAnswer:
        'generals = ["孔秀", "韩福", "孟坦", "王植", "秦琪"]\nfor enemy in generals:\n    print("关羽斩了" + enemy)',
      testCases: [
        {
          expectedOutput:
            '关羽斩了孔秀\n关羽斩了韩福\n关羽斩了孟坦\n关羽斩了王植\n关羽斩了秦琪\n',
          description: '应该逐一斩杀五员大将',
        },
      ],
      hints: [
        'for循环中取出的每个元素需要一个名字，看看print里用的是什么？',
        'print里写了enemy，所以for后面的变量也应该叫enemy',
        '填入"enemy"——让循环变量和print里的变量名匹配',
      ],
      qiReward: 30,
      choices: ['enemy', 'generals', 'i'],
    },
    {
      id: 'ch05-c3',
      type: 'fill_blank',
      prompt: '计数斩将！在空白处填入正确的数字，让计数器每次加一，记录斩将数。',
      codeTemplate:
        'generals = ["孔秀", "韩福", "孟坦", "王植", "秦琪"]\ncount = 0\nfor enemy in generals:\n    count = count + ___\n    print("第" + str(count) + "将：" + enemy + "被斩！")',
      correctAnswer:
        'generals = ["孔秀", "韩福", "孟坦", "王植", "秦琪"]\ncount = 0\nfor enemy in generals:\n    count = count + 1\n    print("第" + str(count) + "将：" + enemy + "被斩！")',
      testCases: [
        {
          expectedOutput:
            '第1将：孔秀被斩！\n第2将：韩福被斩！\n第3将：孟坦被斩！\n第4将：王植被斩！\n第5将：秦琪被斩！\n',
          description: '应该从1数到5，逐一斩将',
        },
      ],
      hints: [
        '每斩一将，计数器应该增加多少？',
        'count从0开始，每次循环加1，就变成1,2,3,4,5',
        '填入"1"——每次加1，计数器就能正确递增',
      ],
      qiReward: 40,
      choices: ['1', '0', 'count'],
    },
  ],
  battle: {
    playerGeneral: 'guan-yu',
    playerSkill: '连弩激射',
    bgScene: '/assets/scenes/peach-garden.png',
  },
  rewards: {
    xp: 300,
    unlockItems: ['chi-tu-ma'],
    quote: '身在曹营心在汉',
  },
};
