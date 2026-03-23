import type { Chapter } from '../types';

export const chapter14: Chapter = {
  id: 'chapter-14',
  act: 4,
  title: '空城计',
  storyIntro:
    '诸葛亮空城退敌，司马懿十五万大军兵临城下，诸葛亮却大开城门、焚香抚琴。' +
    'Class封装就像空城计：外面看不到里面的实现细节！',
  pythonConcept: '封装 Encapsulation',
  difficulty: 5,
  interactionMode: 'code',
  challenges: [
    {
      id: 'ch14-c1',
      type: 'fill_blank',
      prompt: '诸葛亮要用代码建造一座城！在空白处填入关键字来定义一个类。',
      codeTemplate:
        '___ City:\n    def __init__(self, name):\n        self.name = name\n    def show(self):\n        print(self.name + "：城门大开")\n\nxicheng = City("西城")\nxicheng.show()',
      correctAnswer:
        'class City:\n    def __init__(self, name):\n        self.name = name\n    def show(self):\n        print(self.name + "：城门大开")\n\nxicheng = City("西城")\nxicheng.show()',
      testCases: [
        {
          expectedOutput: '西城：城门大开\n',
          description: '应该输出西城：城门大开',
        },
      ],
      hints: [
        'Python中定义类需要用一个特殊的关键字，它和"分类"有关……',
        '定义函数用def，定义类用的关键字是c开头的……',
        '填入 class——Python中定义类的关键字',
      ],
      qiReward: 30,
      choices: ['class', 'def', 'Class'],
    },
    {
      id: 'ch14-c2',
      type: 'fill_blank',
      prompt: '诸葛亮要让将军自报家门！在空白处填入正确的方式来访问对象的属性。',
      codeTemplate:
        'class General:\n    def __init__(self, name, weapon):\n        self.name = name\n        self.weapon = weapon\n    def introduce(self):\n        print(___ + "手持" + self.weapon)\n\nzgl = General("诸葛亮", "羽扇")\nzgl.introduce()',
      correctAnswer:
        'class General:\n    def __init__(self, name, weapon):\n        self.name = name\n        self.weapon = weapon\n    def introduce(self):\n        print(self.name + "手持" + self.weapon)\n\nzgl = General("诸葛亮", "羽扇")\nzgl.introduce()',
      testCases: [
        {
          expectedOutput: '诸葛亮手持羽扇\n',
          description: '应该输出诸葛亮手持羽扇',
        },
      ],
      hints: [
        '在类的方法中，要访问对象自己的属性，需要用一个特殊的前缀……',
        '方法的第一个参数是self，通过self可以访问对象的属性',
        '填入 self.name——在方法中用self.属性名来访问对象的属性',
      ],
      qiReward: 30,
      choices: ['self.name', 'name', 'General.name'],
    },
    {
      id: 'ch14-c3',
      type: 'free_code',
      prompt:
        '诸葛亮需要一个士兵管理系统！创建一个Soldier类，包含name属性和alive属性（默认True），' +
        '以及一个report方法：如果士兵alive，就打印"名字在岗！"。最后创建赵云并调用report。',
      correctAnswer:
        'class Soldier:\n    def __init__(self, name):\n        self.name = name\n        self.alive = True\n    def report(self):\n        if self.alive:\n            print(self.name + "在岗！")\n\ns = Soldier("赵云")\ns.report()',
      testCases: [
        {
          expectedOutput: '赵云在岗！\n',
          description: '应该输出赵云在岗！',
        },
      ],
      hints: [
        '定义类用class关键字，__init__方法用来初始化属性，self代表对象自身',
        '在__init__中设置self.name = name和self.alive = True，然后定义report方法用if判断',
        '完整结构：class Soldier: → __init__设置name和alive → report方法中if self.alive: print(...)',
      ],
      qiReward: 40,
    },
  ],
  battle: {
    playerGeneral: 'zhuge-liang',
    playerSkill: '空城计',
    bgScene: '/assets/scenes/mountain-pass.png',
  },
  rewards: {
    xp: 450,
    quote: '空城计退敌，智者无畏',
  },
};
