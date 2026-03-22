import type { Chapter } from '../types';

export const chapter01: Chapter = {
  id: 'chapter-01',
  act: 1,
  title: '温酒斩华雄',
  storyIntro:
    '十八路诸侯讨伐董卓，先锋大将接连败北。关羽挺身而出，曹操为他斟了一杯热酒壮行。' +
    '关羽说："酒且斟下，某去便来。"只听得鼓声大振，关羽提着华雄首级回到帐中——杯中酒尚温！' +
    '小勇士，让我们用Python记录这段传奇吧！',
  pythonConcept: '变量与字符串',
  difficulty: 2,
  interactionMode: 'mixed',
  challenges: [
    {
      id: 'ch01-c1',
      type: 'drag',
      prompt: '为关羽的传奇武器命名！把正确的代码拖到代码区域。',
      correctAnswer: 'weapon = "青龙偃月刀"',
      testCases: [
        {
          expectedOutput: '',
          description: '变量赋值成功（无输出）',
        },
      ],
      hints: [
        '给武器取名，就像给变量赋值一样——左边是名字，右边是值。',
        '在Python中，字符串需要用引号包裹。weapon = "青龙偃月刀" 才是正确的写法。',
        '正确答案是 weapon = "青龙偃月刀"。注意：变量名不能加引号，字符串值必须加引号！',
      ],
      qiReward: 30,
      dragOptions: [
        {
          id: 'ch01-c1-opt1',
          code: 'weapon = "青龙偃月刀"',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch01-c1-opt2',
          code: 'weapon = 青龙偃月刀',
          isCorrect: false,
        },
        {
          id: 'ch01-c1-opt3',
          code: '"weapon" = "青龙偃月刀"',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'ch01-c2',
      type: 'fill_blank',
      prompt: '关羽即将出战！请在空白处填入正确的英雄名字，让他霸气登场。',
      codeTemplate: 'hero = "___"\nprint(hero + "出战！")',
      correctAnswer: 'hero = "关羽"\nprint(hero + "出战！")',
      testCases: [
        {
          expectedOutput: '关羽出战！\n',
          description: '应该输出"关羽出战！"',
        },
      ],
      hints: [
        '想想这一回的主角是谁？温酒斩华雄的英雄可是威震天下！',
        '这里需要填入一个人名，而这个人正提着青龙偃月刀准备出战。',
        '在空白处填入"关羽"——他就是温酒斩华雄的主角！',
      ],
      qiReward: 30,
      choices: ['关羽', '华雄', '曹操'],
    },
    {
      id: 'ch01-c3',
      type: 'fill_blank',
      prompt: '战斗结束了！用变量名（不是文字）来拼出战果。提示：变量不需要加引号！',
      codeTemplate: 'hero = "关羽"\nenemy = "华雄"\nresult = hero + "斩了" + ___\nprint(result)',
      correctAnswer: 'hero = "关羽"\nenemy = "华雄"\nresult = hero + "斩了" + enemy\nprint(result)',
      testCases: [
        {
          expectedOutput: '关羽斩了华雄\n',
          description: '应该输出"关羽斩了华雄"',
        },
      ],
      hints: [
        '我们已经把华雄的名字存在了一个变量（enemy）里，直接用变量名就好！',
        '变量名直接写，不需要加引号。enemy 是一个变量，它的值是"华雄"。',
        '填入 enemy（不加引号）。这样如果敌人换成别人，代码也不用改！这就是变量的好处。',
      ],
      qiReward: 40,
      choices: ['enemy', 'hero', '"enemy"'],
    },
  ],
  battle: {
    playerGeneral: 'guan-yu',
    enemyGeneral: 'hua-xiong',
    playerSkill: '落日弓',
    bgScene: '/assets/scenes/military-camp.png',
  },
  rewards: {
    xp: 150,
    quote: '酒尚温时斩华雄',
  },
};
