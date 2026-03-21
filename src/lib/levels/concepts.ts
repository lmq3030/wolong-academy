export interface PythonConcept {
  id: string;
  name: string;               // e.g. "print() 输出"
  threeKingdomsName: string;   // e.g. "落日弓"
  description: string;         // Kid-friendly Chinese explanation
  example: string;             // Runnable code example
  expectedOutput: string;      // What the example prints
  unlockedByChapter: string;   // chapter id that unlocks this concept
  act: number;
}

export const concepts: PythonConcept[] = [
  {
    id: 'concept-print',
    name: 'print() 输出',
    threeKingdomsName: '落日弓',
    description: '用print()把文字显示出来，就像发射一支箭，把消息射到屏幕上！',
    example: `print("天下英雄，使君与操耳")
print("三顾茅庐")
print(1 + 2)`,
    expectedOutput: `天下英雄，使君与操耳
三顾茅庐
3`,
    unlockedByChapter: 'chapter-00',
    act: 1,
  },
  {
    id: 'concept-variables',
    name: '变量 (Variables)',
    threeKingdomsName: '命疗术',
    description: '变量就像一个锦囊，可以把东西装进去，以后随时取出来用。',
    example: `hero = "赵云"
weapon = "龙胆亮银枪"
print(hero + "的武器是" + weapon)`,
    expectedOutput: `赵云的武器是龙胆亮银枪`,
    unlockedByChapter: 'chapter-01',
    act: 1,
  },
  {
    id: 'concept-functions',
    name: '函数 (Functions)',
    threeKingdomsName: '八阵图',
    description: '函数就像一套兵法，定义一次，可以反复使用。',
    example: `def war_cry(name):
    print(name + "在此，谁敢一战！")

war_cry("张飞")
war_cry("关羽")`,
    expectedOutput: `张飞在此，谁敢一战！
关羽在此，谁敢一战！`,
    unlockedByChapter: 'chapter-02',
    act: 1,
  },
  {
    id: 'concept-if-else',
    name: 'if/else 条件',
    threeKingdomsName: '伏兵组阵',
    description: 'if/else就像连环计，根据不同情况采取不同策略。',
    example: `soldiers = 500
if soldiers > 1000:
    print("正面迎战！")
else:
    print("使用空城计！")`,
    expectedOutput: `使用空城计！`,
    unlockedByChapter: 'chapter-03',
    act: 1,
  },
  {
    id: 'concept-lists',
    name: '列表 (Lists)',
    threeKingdomsName: '十面埋伏',
    description: '列表就像一份点将册，可以装很多武将的名字。',
    example: `heroes = ["刘备", "关羽", "张飞"]
print(heroes[0])
print(len(heroes))`,
    expectedOutput: `刘备
3`,
    unlockedByChapter: 'chapter-04',
    act: 1,
  },
  {
    id: 'concept-for-loop',
    name: 'for 循环',
    threeKingdomsName: '连弩激射',
    description: 'for循环就像连弩，自动重复发射！',
    example: `generals = ["赵云", "马超", "黄忠"]
for g in generals:
    print(g + "出击！")`,
    expectedOutput: `赵云出击！
马超出击！
黄忠出击！`,
    unlockedByChapter: 'chapter-05',
    act: 1,
  },
  {
    id: 'concept-while-loop',
    name: 'while 循环',
    threeKingdomsName: '七擒孟获',
    description: 'while循环就像七擒孟获，不达目的不罢休！',
    example: `captures = 0
while captures < 3:
    captures += 1
    print("第" + str(captures) + "次擒获孟获")`,
    expectedOutput: `第1次擒获孟获
第2次擒获孟获
第3次擒获孟获`,
    unlockedByChapter: 'chapter-06',
    act: 2,
  },
  {
    id: 'concept-debug',
    name: '调试 (Debug)',
    threeKingdomsName: '刮骨疗毒',
    description: 'Debug就像华佗刮骨疗毒，找到代码里的毒(bug)并清除。',
    example: `# 找出bug并修复
name = "关羽"
# 错误: print(nama)  <- 变量名拼错了
print(name)  # 正确！`,
    expectedOutput: `关羽`,
    unlockedByChapter: 'chapter-07',
    act: 2,
  },
  {
    id: 'concept-list-ops',
    name: '列表操作',
    threeKingdomsName: '草船借箭',
    description: 'append就像草船借箭，一批批地收集数据。',
    example: `arrows = []
arrows.append("第一批箭")
arrows.append("第二批箭")
arrows.append("第三批箭")
print("共借到", len(arrows), "批箭")`,
    expectedOutput: `共借到 3 批箭`,
    unlockedByChapter: 'chapter-08',
    act: 2,
  },
  {
    id: 'concept-search',
    name: '搜索算法',
    threeKingdomsName: '赵云长坂坡',
    description: '搜索算法就像赵云在百万军中寻找阿斗。',
    example: `army = ["曹兵", "曹兵", "阿斗", "曹兵"]
for i, person in enumerate(army):
    if person == "阿斗":
        print("在位置" + str(i) + "找到阿斗！")`,
    expectedOutput: `在位置2找到阿斗！`,
    unlockedByChapter: 'chapter-10',
    act: 3,
  },
  {
    id: 'concept-stack',
    name: '栈 (Stack)',
    threeKingdomsName: '单刀赴会',
    description: '栈就像穿越层层伏兵：最后进去的，最先出来。',
    example: `stack = []
stack.append("第一层伏兵")
stack.append("第二层伏兵")
stack.append("第三层伏兵")
print(stack.pop())  # 最后进，最先出`,
    expectedOutput: `第三层伏兵`,
    unlockedByChapter: 'chapter-11',
    act: 3,
  },
  {
    id: 'concept-queue',
    name: '队列 (Queue)',
    threeKingdomsName: '水淹七军',
    description: '队列就像排队过河：先来的先走。',
    example: `from collections import deque
queue = deque(["于禁", "庞德", "曹仁"])
first = queue.popleft()
print(first + "先过河")`,
    expectedOutput: `于禁先过河`,
    unlockedByChapter: 'chapter-12',
    act: 3,
  },
  {
    id: 'concept-dict',
    name: '字典 (Dict)',
    threeKingdomsName: '锦囊妙计',
    description: '字典就像锦囊：每个锦囊有个名字，打开就能取出对应的计策。',
    example: `plans = {"第一计": "联吴抗曹", "第二计": "火烧赤壁"}
print(plans["第一计"])
print(len(plans), "条妙计")`,
    expectedOutput: `联吴抗曹
2 条妙计`,
    unlockedByChapter: 'chapter-13',
    act: 4,
  },
  {
    id: 'concept-encapsulation',
    name: '封装 (Encapsulation)',
    threeKingdomsName: '空城计',
    description: '封装就像空城计：外面看不到里面有多少兵。',
    example: `class City:
    def __init__(self, name):
        self._soldiers = 0  # 外面看不到
        self.name = name
    def show(self):
        print(self.name + "：城门大开")

xicheng = City("西城")
xicheng.show()`,
    expectedOutput: `西城：城门大开`,
    unlockedByChapter: 'chapter-14',
    act: 4,
  },
  {
    id: 'concept-custom-ds',
    name: '自定义数据结构',
    threeKingdomsName: '木牛流马',
    description: '组合多种数据结构，就像诸葛亮发明木牛流马。',
    example: `class Supply:
    def __init__(self):
        self.items = {}
    def add(self, name, qty):
        self.items[name] = qty
    def show(self):
        for k, v in self.items.items():
            print(k + ": " + str(v))

cart = Supply()
cart.add("粮草", 100)
cart.add("箭矢", 500)
cart.show()`,
    expectedOutput: `粮草: 100
箭矢: 500`,
    unlockedByChapter: 'chapter-15',
    act: 4,
  },
];
