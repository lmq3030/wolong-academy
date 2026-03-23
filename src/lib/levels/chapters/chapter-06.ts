import type { Chapter } from '../types';

export const chapter06: Chapter = {
  id: 'chapter-06',
  act: 2,
  title: '七擒孟获',
  storyIntro:
    '诸葛亮率军南征，面对蛮王孟获，七擒七纵，以攻心之计使其心服口服。' +
    'while循环就像不断抓住又放走，直到条件满足才停下！',
  pythonConcept: 'while 循环',
  difficulty: 3,
  interactionMode: 'fill',
  challenges: [
    {
      id: 'ch06-c1',
      type: 'fill_blank',
      prompt: '诸葛亮要擒获孟获多次！在空白处填入正确的数字，让循环执行3次。',
      codeTemplate:
        'captures = 0\nwhile captures < ___:\n    captures += 1\n    print("第" + str(captures) + "次擒获孟获")',
      correctAnswer:
        'captures = 0\nwhile captures < 3:\n    captures += 1\n    print("第" + str(captures) + "次擒获孟获")',
      testCases: [
        {
          expectedOutput:
            '第1次擒获孟获\n第2次擒获孟获\n第3次擒获孟获\n',
          description: '应该输出三次擒获孟获',
        },
      ],
      hints: [
        '诸葛亮这次先擒获几次？从captures=0开始，循环到什么时候停？',
        'while captures < n 会循环n次（captures从0开始每次加1）',
        '填入"3"——while captures < 3会让循环执行3次',
      ],
      qiReward: 30,
      choices: ['3', '7', '0'],
    },
    {
      id: 'ch06-c2',
      type: 'fill_blank',
      prompt: '孟获每次被擒都要损失体力！在空白处填入正确的运算符，让血量递减。',
      codeTemplate:
        'health = 100\nwhile health > 0:\n    health ___ 30\n    print("孟获损失30血，剩余：" + str(health))',
      correctAnswer:
        'health = 100\nwhile health > 0:\n    health -= 30\n    print("孟获损失30血，剩余：" + str(health))',
      testCases: [
        {
          expectedOutput:
            '孟获损失30血，剩余：70\n孟获损失30血，剩余：40\n孟获损失30血，剩余：10\n孟获损失30血，剩余：-20\n',
          description: '血量应该从100每次减30直到小于等于0',
        },
      ],
      hints: [
        '孟获在损失血量，血量应该是减少的……',
        '-= 是减法赋值运算符，health -= 30 等于 health = health - 30',
        '填入"-="——让血量每次减少30',
      ],
      qiReward: 30,
      choices: ['-=', '+=', '=='],
    },
    {
      id: 'ch06-c3',
      type: 'fill_blank',
      prompt: '第七次擒获时孟获终于心服口服！在空白处填入关键字，跳出无限循环。',
      codeTemplate:
        'count = 0\nwhile True:\n    count += 1\n    if count == 7:\n        print("第七次擒获！孟获终于服了！")\n        ___',
      correctAnswer:
        'count = 0\nwhile True:\n    count += 1\n    if count == 7:\n        print("第七次擒获！孟获终于服了！")\n        break',
      testCases: [
        {
          expectedOutput: '第七次擒获！孟获终于服了！\n',
          description: '应该在第七次时输出并跳出循环',
        },
      ],
      hints: [
        '当条件满足时，我们需要跳出while True这个无限循环……',
        'Python中有三个循环控制关键字：break跳出、continue跳过、pass什么都不做',
        '填入"break"——break会立即跳出整个while循环',
      ],
      qiReward: 40,
      choices: ['break', 'continue', 'pass'],
    },
  ],
  battle: {
    playerGeneral: 'zhuge-liang',
    playerSkill: '七擒孟获',
    bgScene: '/assets/scenes/mountain-pass.png',
  },
  rewards: {
    xp: 250,
    quote: '攻心为上，攻城为下',
  },
};
