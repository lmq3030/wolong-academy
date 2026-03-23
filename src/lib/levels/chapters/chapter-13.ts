import type { Chapter } from '../types';

export const chapter13: Chapter = {
  id: 'chapter-13',
  act: 4,
  title: '锦囊妙计',
  storyIntro:
    '诸葛亮给刘备三个锦囊，每个锦囊装着不同的妙计。' +
    '字典就像锦囊：用key取出value！',
  pythonConcept: '字典 Dict',
  difficulty: 4,
  interactionMode: 'mixed',
  challenges: [
    {
      id: 'ch13-c1',
      type: 'drag',
      prompt: '诸葛亮要用字典存储锦囊妙计！把正确的代码拖到位置上，创建一个字典并取出第一计。',
      correctAnswer:
        'plans = {"第一计": "联吴抗曹", "第二计": "火烧赤壁"}\nprint(plans["第一计"])',
      testCases: [
        {
          expectedOutput: '联吴抗曹\n',
          description: '应该输出第一计的内容',
        },
      ],
      hints: [
        '字典用花括号{}来创建，里面是key:value的形式……',
        '字典的格式是 {key: value}，用方括号[]来取值，不是圆括号()',
        '正确答案用花括号{}创建字典，用["第一计"]取出对应的值',
      ],
      qiReward: 30,
      dragOptions: [
        {
          id: 'ch13-c1-opt1',
          code: 'plans = {"第一计": "联吴抗曹", "第二计": "火烧赤壁"}\nprint(plans["第一计"])',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch13-c1-opt2',
          code: 'plans = ["第一计", "联吴抗曹"]\nprint(plans["第一计"])',
          isCorrect: false,
        },
        {
          id: 'ch13-c1-opt3',
          code: 'plans = ("第一计": "联吴抗曹")\nprint(plans["第一计"])',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'ch13-c2',
      type: 'fill_blank',
      prompt: '锦囊里有三条妙计，诸葛亮要取出第二条"火攻"。填入正确的key来取出对应的value！',
      codeTemplate:
        'bag = {"锦囊一": "借东风", "锦囊二": "火攻", "锦囊三": "撤退"}\nplan = bag[___]\nprint("妙计：" + plan)',
      correctAnswer:
        'bag = {"锦囊一": "借东风", "锦囊二": "火攻", "锦囊三": "撤退"}\nplan = bag["锦囊二"]\nprint("妙计：" + plan)',
      testCases: [
        {
          expectedOutput: '妙计：火攻\n',
          description: '应该输出妙计：火攻',
        },
      ],
      hints: [
        '字典通过key来取值，key是什么类型的？看看字典里的key是怎么写的……',
        '字典的key是字符串"锦囊二"，取值时也要用字符串，记得加引号',
        '填入 "锦囊二"——带双引号，因为key是字符串类型',
      ],
      qiReward: 30,
      choices: ['"锦囊二"', '锦囊二', '1'],
    },
    {
      id: 'ch13-c3',
      type: 'fill_blank',
      prompt: '锦囊只有一条计策，诸葛亮要往里加一条新的！填入正确的key来添加新的键值对。',
      codeTemplate:
        'bag = {"锦囊一": "借东风"}\nbag[___] = "火攻"\nprint(len(bag))',
      correctAnswer:
        'bag = {"锦囊一": "借东风"}\nbag["锦囊二"] = "火攻"\nprint(len(bag))',
      testCases: [
        {
          expectedOutput: '2\n',
          description: '添加后字典应该有2个元素',
        },
      ],
      hints: [
        '给字典添加新元素，格式是 dict[new_key] = value，想想new_key应该是什么……',
        '已经有"锦囊一"了，新加的应该叫什么？别忘了key是字符串要加引号',
        '填入 "锦囊二"——带双引号的字符串作为新的key',
      ],
      qiReward: 40,
      choices: ['"锦囊二"', 'append', '1'],
    },
  ],
  battle: {
    playerGeneral: 'zhuge-liang',
    playerSkill: '锦囊妙计',
    bgScene: '/assets/scenes/palace-night.png',
  },
  rewards: {
    xp: 400,
    quote: '万事俱备，只欠东风',
  },
};
