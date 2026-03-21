import type { Chapter } from '../types';

export const chapter02: Chapter = {
  id: 'chapter-02',
  act: 1,
  title: '三英战吕布',
  storyIntro:
    '吕布天下第一猛将，无人能敌。刘备、关羽、张飞三人联手，用"合击之术"才勉强与之抗衡。' +
    '小朋友要学会定义和调用函数——就像组合三兄弟的力量！',
  pythonConcept: '函数定义与调用',
  difficulty: 2,
  interactionMode: 'mixed',
  challenges: [
    {
      id: 'ch02-c1',
      type: 'drag',
      prompt: '定义一个攻击函数！把正确的代码拖到代码区域，让三兄弟学会攻击招式。',
      correctAnswer: 'def attack(name):\n    print(name + "出击！")',
      testCases: [
        {
          expectedOutput: '',
          description: '函数定义成功（无输出）',
        },
      ],
      hints: [
        '函数需要用def开头哦',
        '别忘了括号里的参数',
        'def attack(name): 这就是函数的定义方式',
      ],
      qiReward: 30,
      dragOptions: [
        {
          id: 'ch02-c1-opt1',
          code: 'def attack(name):',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch02-c1-opt2',
          code: '    print(name + "出击！")',
          isCorrect: true,
          slot: 1,
        },
        {
          id: 'ch02-c1-opt3',
          code: 'attack(name):',
          isCorrect: false,
        },
        {
          id: 'ch02-c1-opt4',
          code: 'def attack name:',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'ch02-c2',
      type: 'fill_blank',
      prompt: '调用函数让三兄弟出击！在空白处填入正确的英雄名字。',
      codeTemplate:
        'def attack(name):\n    print(name + "出击！")\n\nattack("___")',
      correctAnswer:
        'def attack(name):\n    print(name + "出击！")\n\nattack("刘备")',
      testCases: [
        {
          expectedOutput: '刘备出击！\n',
          description: '应该输出"刘备出击！"',
        },
      ],
      hints: [
        '我们要让谁先出击呢？',
        '大哥刘备应该先上',
        '填入"刘备"就对了',
      ],
      qiReward: 30,
      choices: ['刘备', '吕布', 'attack'],
    },
    {
      id: 'ch02-c3',
      type: 'fill_blank',
      prompt: '三兄弟依次出击！在空白处填入正确的英雄名字，让合击之术完整发动。',
      codeTemplate:
        'def attack(name):\n    print(name + "出击！")\n\nattack("刘备")\nattack("___")\nattack("张飞")',
      correctAnswer:
        'def attack(name):\n    print(name + "出击！")\n\nattack("刘备")\nattack("关羽")\nattack("张飞")',
      testCases: [
        {
          expectedOutput: '刘备出击！\n关羽出击！\n张飞出击！\n',
          description: '应该按顺序输出三兄弟出击',
        },
      ],
      hints: [
        '二弟是谁？',
        '大哥刘备，二弟关羽，三弟张飞',
        '填入"关羽"',
      ],
      qiReward: 40,
      choices: ['关羽', '吕布', '诸葛亮'],
    },
  ],
  battle: {
    playerGeneral: 'liu-bei',
    enemyGeneral: 'lu-bu',
    playerSkill: '三英合击',
    bgScene: '/assets/scenes/peach-garden.png',
  },
  rewards: {
    xp: 200,
    unlockGenerals: ['lu-bu'],
    quote: '人中吕布，马中赤兔',
  },
};
