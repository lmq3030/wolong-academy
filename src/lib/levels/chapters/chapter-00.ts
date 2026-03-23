import type { Chapter } from '../types';

export const chapter00: Chapter = {
  id: 'chapter-00',
  act: 1,
  title: '桃园三结义',
  storyIntro:
    '东汉末年，天下大乱。刘备、关羽、张飞三人志同道合，在张飞庄后的桃园中结为异姓兄弟。' +
    '他们焚香祭天，立下誓言，要同心协力，匡扶汉室。小勇士，请用Python帮他们写下这历史性的誓词吧！',
  pythonConcept: 'print() 基础输出',
  difficulty: 1,
  interactionMode: 'drag',
  challenges: [
    {
      id: 'ch00-c1',
      type: 'drag',
      prompt: '帮刘备写下结义誓词！把正确的代码拖到代码区域。',
      correctAnswer: 'print("桃园三结义")',
      testCases: [
        {
          expectedOutput: '桃园三结义\n',
          description: '应该输出"桃园三结义"',
        },
      ],
      hints: [
        '将军莫急！看看哪块积木上的代码最完整、最规范。',
        'Python的 print() 函数需要用引号把文字包起来哦。',
        '正确答案是 print("桃园三结义")——注意双引号不能少！',
      ],
      qiReward: 30,
      dragOptions: [
        {
          id: 'ch00-c1-opt1',
          code: 'print("桃园三结义")',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch00-c1-opt2',
          code: 'print(桃园三结义)',
          isCorrect: false,
        },
        {
          id: 'ch00-c1-opt3',
          code: 'Print("桃园三结义")',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'ch00-c2',
      type: 'drag',
      prompt: '为三兄弟中的大哥起个名字，并让Python说出他的名字！按顺序拖入两块代码。',
      correctAnswer: 'name = "刘备"\nprint(name)',
      testCases: [
        {
          expectedOutput: '刘备\n',
          description: '应该输出"刘备"',
        },
      ],
      hints: [
        '先给变量赋值，再用 print 输出，就像先取名再点兵一样！',
        '第一步用 name = "刘备" 赋值，第二步用 print(name) 输出——注意 print 里不加引号。',
        '正确顺序：先 name = "刘备"，再 print(name)。print("name") 会输出文字"name"而不是变量哦。',
      ],
      qiReward: 30,
      dragOptions: [
        {
          id: 'ch00-c2-opt1',
          code: 'name = "刘备"',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch00-c2-opt2',
          code: 'print(name)',
          isCorrect: true,
          slot: 1,
        },
        {
          id: 'ch00-c2-opt3',
          code: 'name = 刘备',
          isCorrect: false,
        },
        {
          id: 'ch00-c2-opt4',
          code: 'print("name")',
          isCorrect: false,
        },
      ],
    },
    {
      id: 'ch00-c3',
      type: 'drag',
      prompt: '按顺序介绍桃园三兄弟！把三行代码按正确的顺序拖入。记住：刘备是大哥，关羽是二弟，张飞是三弟。',
      correctAnswer:
        'print("大哥：刘备")\nprint("二弟：关羽")\nprint("三弟：张飞")',
      testCases: [
        {
          expectedOutput: '大哥：刘备\n二弟：关羽\n三弟：张飞\n',
          description: '应该按正确顺序介绍三兄弟',
        },
      ],
      hints: [
        '三兄弟论长幼有序，代码执行也是从上到下，顺序很重要！',
        '大哥刘备排第一，二弟关羽排第二，三弟张飞排第三。赵云虽勇，但他不是桃园结义的兄弟哦。',
        '正确顺序：print("大哥：刘备") → print("二弟：关羽") → print("三弟：张飞")。赵云那块是干扰项！',
      ],
      qiReward: 40,
      dragOptions: [
        {
          id: 'ch00-c3-opt1',
          code: 'print("大哥：刘备")',
          isCorrect: true,
          slot: 0,
        },
        {
          id: 'ch00-c3-opt2',
          code: 'print("二弟：关羽")',
          isCorrect: true,
          slot: 1,
        },
        {
          id: 'ch00-c3-opt3',
          code: 'print("三弟：张飞")',
          isCorrect: true,
          slot: 2,
        },
        {
          id: 'ch00-c3-opt4',
          code: 'print(大哥：刘备)',
          isCorrect: false,
        },
        {
          id: 'ch00-c3-opt5',
          code: 'print(二弟：关羽)',
          isCorrect: false,
        },
      ],
    },
  ],
  battle: {
    playerGeneral: 'liu-bei',
    playerSkill: '双股剑法',
    bgScene: '/assets/scenes/peach-garden.png',
  },
  rewards: {
    xp: 100,
    unlockGenerals: ['liu-bei', 'guan-yu', 'zhang-fei'],
    quote: '不求同年同月同日生，但求同年同月同日死',
  },
};
