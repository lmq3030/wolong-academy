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
    example: `# 显示一段文字（要用引号包起来）
print("天下英雄，使君与操耳")
print("三顾茅庐")
# 也可以显示数字和算术（不用引号）
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
    example: `# 用 = 把内容装进变量（盒子）
hero = "赵云"
weapon = "龙胆亮银枪"
# 用 + 把变量和文字拼在一起
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
    example: `# 定义一个叫 war_cry 的函数，name 是参数
def war_cry(name):
    print(name + "在此，谁敢一战！")

# 调用函数，传入不同的名字
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
# 如果士兵超过1000，就正面打
if soldiers > 1000:
    print("正面迎战！")
# 否则用计谋
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
    example: `# 用方括号创建列表，逗号隔开
heroes = ["刘备", "关羽", "张飞"]
# 用编号取元素（从0开始数！）
print(heroes[0])
# len() 数出列表有几个元素
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
    description: 'for循环让代码自动重复执行——告诉它"执行几次"或者"对每个东西都做一遍"，它就会乖乖照做！',
    example: `# 用法一：range(3) 产生 0, 1, 2 三个数
for i in range(3):
    print("第", i + 1, "箭！")

# 用法二：逐个取出列表里的内容
generals = ["赵云", "马超", "黄忠"]
for g in generals:
    print(g + "出击！")`,
    expectedOutput: `第 1 箭！
第 2 箭！
第 3 箭！
赵云出击！
马超出击！
黄忠出击！`,
    unlockedByChapter: 'chapter-05',
    act: 1,
  },
  {
    id: 'concept-while-loop',
    name: 'while 循环',
    threeKingdomsName: '七擒孟获',
    description: 'while循环会一直重复执行，直到条件不再满足才停下来。跟for不同，while不需要提前知道要重复几次！',
    example: `# 第一步：设定初始值
captures = 0
# 第二步：while 检查条件，满足才执行
while captures < 3:
    # 第三步：更新变量（很重要！不然会死循环）
    captures += 1
    print("第", captures, "次擒获孟获")
# captures 变成 3，3 < 3 不成立，循环结束
print("孟获服了！")`,
    expectedOutput: `第 1 次擒获孟获
第 2 次擒获孟获
第 3 次擒获孟获
孟获服了！`,
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
# append() 往列表末尾添加
arrows.append("第一批箭")
arrows.append("第二批箭")
arrows.append("第三批箭")
print("共借到", len(arrows), "批箭")
# pop() 取出并删除最后一个
last = arrows.pop()
print("取出:", last)
print("还剩", len(arrows), "批箭")`,
    expectedOutput: `共借到 3 批箭
取出: 第三批箭
还剩 2 批箭`,
    unlockedByChapter: 'chapter-08',
    act: 2,
  },
  {
    id: 'concept-strings',
    name: '字符串操作',
    threeKingdomsName: '密信传书',
    description: '字符串就像密信，可以拼接、截取、测量长度。',
    example: `message = "火" + "攻" + "曹营"
print(message)
print("密信长度：" + str(len(message)))
print("第一个字：" + message[0])`,
    expectedOutput: `火攻曹营
密信长度：4
第一个字：火`,
    unlockedByChapter: 'chapter-09',
    act: 2,
  },
  {
    id: 'concept-search',
    name: '搜索算法',
    threeKingdomsName: '赵云长坂坡',
    description: '搜索算法就像赵云在百万军中寻找阿斗。',
    example: `army = ["曹兵", "曹兵", "阿斗", "曹兵"]
# enumerate 同时给出编号 i 和内容 person
for i, person in enumerate(army):
    if person == "阿斗":
        print("在位置", i, "找到阿斗！")`,
    expectedOutput: `在位置 2 找到阿斗！`,
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
    example: `# import = 从工具箱里拿出需要的工具
from collections import deque
queue = deque(["于禁", "庞德", "曹仁"])
# popleft() 从队头取出第一个人
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
    example: `# 花括号创建字典，"键": "值" 成对出现
plans = {"第一计": "联吴抗曹", "第二计": "火烧赤壁"}
# 用键名取出对应的值
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
    example: `# class = 设计图纸，描述"城"长什么样
class City:
    # __init__ 在创建时自动运行，self = 自己
    def __init__(self, name):
        self._soldiers = 0  # 下划线 = 内部数据
        self.name = name
    def show(self):
        print(self.name + "：城门大开")

# 用图纸造出一个叫"西城"的对象
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
    example: `# 用 class 组合字典，造出"补给车"
class Supply:
    def __init__(self):
        self.items = {}  # 内部用字典存数据
    def add(self, name, qty):
        self.items[name] = qty
    def show(self):
        # k=键（物品名），v=值（数量）
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
