import type { Chapter } from '../types';

export const chapter12: Chapter = {
  id: 'chapter-12',
  act: 3,
  title: '水淹七军',
  storyIntro:
    '关羽水淹七军，洪水按顺序冲走敌军。于禁最先列阵，最先被冲走；' +
    '队列就像排队：先来先走！',
  pythonConcept: '队列 Queue - deque',
  difficulty: 5,
  interactionMode: 'code',
  challenges: [
    {
      id: 'ch12-c1',
      type: 'fill_blank',
      prompt: '关羽引水淹敌！先创建一个队列，然后把敌将加入队列。填入正确的创建方式。',
      codeTemplate:
        'from collections import deque\ntroops = ___\ntroops.append("于禁")\ntroops.append("庞德")\nprint(troops)',
      correctAnswer:
        'from collections import deque\ntroops = deque()\ntroops.append("于禁")\ntroops.append("庞德")\nprint(troops)',
      testCases: [
        {
          expectedOutput: "deque(['于禁', '庞德'])\n",
          description: '应该创建deque并添加两个元素',
        },
      ],
      hints: [
        '队列在Python中可以用collections模块中的一个特殊类型来创建。',
        '我们已经import了deque，现在需要调用它来创建一个空队列',
        '填入"deque()"——创建一个空的双端队列',
      ],
      qiReward: 30,
      choices: ['deque()', '[]', 'queue()'],
    },
    {
      id: 'ch12-c2',
      type: 'fill_blank',
      prompt: '洪水来了！最前面的敌将最先被冲走。填入正确的方法，从队列前端取出元素。',
      codeTemplate:
        'from collections import deque\ntroops = deque(["于禁", "庞德", "曹仁"])\nfirst = troops.___\nprint(first + "被洪水冲走！")',
      correctAnswer:
        'from collections import deque\ntroops = deque(["于禁", "庞德", "曹仁"])\nfirst = troops.popleft()\nprint(first + "被洪水冲走！")',
      testCases: [
        {
          expectedOutput: '于禁被洪水冲走！\n',
          description: '应该取出队列第一个元素"于禁"',
        },
      ],
      hints: [
        '队列是先进先出的，要从左边（前端）取出元素。',
        'deque有一个专门从左边弹出元素的方法，名字里带"left"',
        '填入"popleft()"——从队列前端取出第一个加入的元素',
      ],
      qiReward: 30,
      choices: ['popleft()', 'pop()', 'remove()'],
    },
    {
      id: 'ch12-c3',
      type: 'free_code',
      prompt:
        '洪水持续冲刷！用while循环将队列中的敌将逐一从前端取出，直到全部被水淹没。',
      correctAnswer:
        'from collections import deque\ntroops = deque(["于禁", "庞德", "曹仁"])\nwhile len(troops) > 0:\n    soldier = troops.popleft()\n    print(soldier + "被水淹！")',
      testCases: [
        {
          expectedOutput: '于禁被水淹！\n庞德被水淹！\n曹仁被水淹！\n',
          description: '应该按先进先出顺序输出所有敌将被水淹',
        },
      ],
      hints: [
        '和栈类似，用while循环判断队列是否为空，但这次要从前端取出。',
        '用while len(troops) > 0循环，每次用troops.popleft()取出最前面的敌将',
        '完整思路：创建deque，while循环中popleft()取出并打印"XXX被水淹！"',
      ],
      qiReward: 40,
    },
  ],
  battle: {
    playerGeneral: 'guan-yu',
    playerSkill: '水淹七军',
    bgScene: '/assets/scenes/red-cliffs.png',
  },
  rewards: {
    xp: 400,
    quote: '水淹七军，威震华夏',
  },
};
