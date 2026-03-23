import type { Chapter } from '../types';

export const chapter11: Chapter = {
  id: 'chapter-11',
  act: 3,
  title: '单刀赴会',
  storyIntro:
    '关羽单刀赴会，穿越层层伏兵。进入宴会厅的路上，' +
    '伏兵一层接一层。栈就像穿越伏兵：后进先出！',
  pythonConcept: '栈 Stack - append/pop',
  difficulty: 4,
  interactionMode: 'code',
  challenges: [
    {
      id: 'ch11-c1',
      type: 'free_code',
      prompt:
        '关羽步步深入敌营。创建一个空列表作为栈，用append依次压入"第一层"、"第二层"、"第三层"，然后用print(stack[-1])打印栈顶元素。',
      correctAnswer:
        'stack = []\nstack.append("第一层")\nstack.append("第二层")\nstack.append("第三层")\nprint(stack[-1])',
      testCases: [
        {
          expectedOutput: '第三层\n',
          description: '应该输出栈顶元素"第三层"',
        },
      ],
      hints: [
        '栈可以用Python列表来实现，用append()往栈里添加元素。',
        '用stack.append()依次添加"第一层"、"第二层"、"第三层"，然后用stack[-1]查看栈顶',
        '完整代码：创建空列表，三次append，最后print(stack[-1])输出最后压入的元素',
      ],
      qiReward: 30,
    },
    {
      id: 'ch11-c2',
      type: 'fill_blank',
      prompt: '关羽一路杀退伏兵，从栈中弹出最后遇到的陷阱！填入正确的方法名。',
      codeTemplate:
        'traps = ["伏兵", "毒酒", "刀斧手"]\nlast_trap = traps.___()\nprint("最后的陷阱是：" + last_trap)',
      correctAnswer:
        'traps = ["伏兵", "毒酒", "刀斧手"]\nlast_trap = traps.pop()\nprint("最后的陷阱是：" + last_trap)',
      testCases: [
        {
          expectedOutput: '最后的陷阱是：刀斧手\n',
          description: '应该弹出并输出最后一个元素"刀斧手"',
        },
      ],
      hints: [
        '栈的核心操作是"弹出"最后加入的元素，想想哪个方法能做到。',
        '列表有一个方法可以移除并返回最后一个元素',
        '填入"pop"——pop()会移除并返回列表最后一个元素',
      ],
      qiReward: 30,
      choices: ['pop', 'remove', 'get'],
    },
    {
      id: 'ch11-c3',
      type: 'free_code',
      prompt:
        '关羽原路返回！创建栈并依次压入"关羽进入"、"遇到伏兵"、"斩杀守卫"，然后用while循环和pop()将所有元素弹出并打印，观察后进先出的顺序。',
      correctAnswer:
        'stack = []\nstack.append("关羽进入")\nstack.append("遇到伏兵")\nstack.append("斩杀守卫")\nwhile len(stack) > 0:\n    print(stack.pop())',
      testCases: [
        {
          expectedOutput: '斩杀守卫\n遇到伏兵\n关羽进入\n',
          description: '应该按后进先出的顺序输出所有元素',
        },
      ],
      hints: [
        '先用append压入三个元素，然后用循环逐个弹出。',
        '用while len(stack) > 0判断栈是否为空，每次循环中用stack.pop()弹出并打印',
        '完整思路：创建空列表，三次append，然后while循环中print(stack.pop())直到栈空',
      ],
      qiReward: 40,
    },
  ],
  battle: {
    playerGeneral: 'guan-yu',
    playerSkill: '单刀赴会',
    bgScene: '/assets/scenes/palace-night.png',
  },
  rewards: {
    xp: 350,
    quote: '单刀赴会，英雄胆色',
  },
};
