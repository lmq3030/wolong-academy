import type { Chapter } from '../types';

export const chapter15: Chapter = {
  id: 'chapter-15',
  act: 4,
  title: '木牛流马',
  storyIntro:
    '诸葛亮发明木牛流马运送粮草，解决了蜀军千里运粮的难题。' +
    '组合class和dict/list，创造自己的数据结构——就像发明木牛流马一样！',
  pythonConcept: '自定义数据结构',
  difficulty: 5,
  interactionMode: 'code',
  challenges: [
    {
      id: 'ch15-c1',
      type: 'fill_blank',
      prompt: '木牛流马需要一个货仓来存放物资！在空白处填入正确的值来初始化一个空字典。',
      codeTemplate:
        'class Supply:\n    def __init__(self):\n        self.items = ___\n    def add(self, name, qty):\n        self.items[name] = qty\n\ncart = Supply()\ncart.add("粮草", 100)\nprint(cart.items)',
      correctAnswer:
        'class Supply:\n    def __init__(self):\n        self.items = {}\n    def add(self, name, qty):\n        self.items[name] = qty\n\ncart = Supply()\ncart.add("粮草", 100)\nprint(cart.items)',
      testCases: [
        {
          expectedOutput: "{'粮草': 100}\n",
          description: '应该输出包含粮草的字典',
        },
      ],
      hints: [
        '我们需要一个空的容器来存放key-value对，什么数据类型用花括号表示？',
        '空字典的写法是两个花括号，空列表是两个方括号——我们需要哪个？',
        '填入 {}——空字典，这样后面才能用 self.items[name] = qty 来添加物资',
      ],
      qiReward: 30,
      choices: ['{}', '[]', 'None'],
    },
    {
      id: 'ch15-c2',
      type: 'fill_blank',
      prompt: '木牛流马要清点所有物资！在空白处填入正确的字典方法来同时遍历key和value。',
      codeTemplate:
        'class Supply:\n    def __init__(self):\n        self.items = {}\n    def add(self, name, qty):\n        self.items[name] = qty\n    def show(self):\n        for k, v in self.items.___:\n            print(k + ": " + str(v))\n\ncart = Supply()\ncart.add("粮草", 100)\ncart.add("箭矢", 500)\ncart.show()',
      correctAnswer:
        'class Supply:\n    def __init__(self):\n        self.items = {}\n    def add(self, name, qty):\n        self.items[name] = qty\n    def show(self):\n        for k, v in self.items.items():\n            print(k + ": " + str(v))\n\ncart = Supply()\ncart.add("粮草", 100)\ncart.add("箭矢", 500)\ncart.show()',
      testCases: [
        {
          expectedOutput: '粮草: 100\n箭矢: 500\n',
          description: '应该输出所有物资名称和数量',
        },
      ],
      hints: [
        '字典有几个遍历方法：keys()只遍历key，values()只遍历value，还有一个能同时遍历两者……',
        '我们需要同时获取k和v，keys()和values()都只返回一个值，需要返回键值对的方法',
        '填入 items()——dict.items()返回所有(key, value)对，可以同时解包为k和v',
      ],
      qiReward: 30,
      choices: ['items()', 'keys()', 'values()'],
    },
    {
      id: 'ch15-c3',
      type: 'free_code',
      prompt:
        '诸葛亮要建立一支完整的军队！创建Army类，包含name属性和soldiers列表。' +
        '实现recruit方法（添加士兵名字）和count方法（打印"军队名共有X人"）。' +
        '创建蜀军，招募赵云、马超、黄忠，然后调用count。',
      correctAnswer:
        'class Army:\n    def __init__(self, name):\n        self.name = name\n        self.soldiers = []\n    def recruit(self, soldier):\n        self.soldiers.append(soldier)\n    def count(self):\n        print(self.name + "共有" + str(len(self.soldiers)) + "人")\n\nshu = Army("蜀军")\nshu.recruit("赵云")\nshu.recruit("马超")\nshu.recruit("黄忠")\nshu.count()',
      testCases: [
        {
          expectedOutput: '蜀军共有3人\n',
          description: '应该输出蜀军共有3人',
        },
      ],
      hints: [
        '类中可以组合使用列表——在__init__中初始化空列表，用append方法添加元素',
        'recruit方法用self.soldiers.append(soldier)，count方法用len(self.soldiers)获取人数',
        '完整结构：class Army: → __init__设置name和空soldiers列表 → recruit用append → count用len和str拼接输出',
      ],
      qiReward: 40,
    },
  ],
  battle: {
    playerGeneral: 'zhuge-liang',
    playerSkill: '木牛流马',
    bgScene: '/assets/scenes/military-camp.png',
  },
  rewards: {
    xp: 500,
    quote: '鞠躬尽瘁，死而后已',
  },
};
