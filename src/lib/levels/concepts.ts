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
    example: `# ← 井号开头的是"注释"，给人看的说明，Python 会忽略它
# print() 是命令，括号里放要显示的内容
# 文字要用引号包起来（告诉 Python 这是文字不是命令）
# 每次 print 都会从新的一行开始输出
print("天下英雄，使君与操耳")
print("三顾茅庐")
# 数字和算术不需要引号（+ 在数字间是加法）
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
    example: `# = 是"放进去"（赋值），不是数学的"等于"
# 把"赵云"放进叫 hero 的盒子里
hero = "赵云"
# 可以建很多个变量，每个装不同的东西
weapon = "龙胆亮银枪"
# + 在文字间是"拼接"（把多段文字连在一起）
# 注意：变量名不加引号，文字要加引号
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
    example: `# def = define（定义），告诉 Python"我要创建一个函数"
# war_cry = 函数名（你自己起的，下划线用来分词）
# (name) = 参数，函数需要的"输入"
# : = 冒号，表示"下面缩进的代码属于这个函数"
def war_cry(name):
    # 缩进（前面4个空格）= 这行在函数内部
    print(name + "在此，谁敢一战！")

# 注意：上面只是"定义"，代码还没执行！
# 调用函数：函数名(参数值)，这时才真正执行
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
# if = "如果"，后面跟条件
# > 是"大于"，Python 判断条件是 True(成立) 还是 False(不成立)
# : = 冒号，后面缩进的代码在条件成立时执行
if soldiers > 1000:
    print("正面迎战！")
# else: = "否则"（也要冒号！必须和 if 对齐）
else:
    print("使用空城计！")
# 500 > 1000 是 False，所以走 else 分支`,
    expectedOutput: `使用空城计！`,
    unlockedByChapter: 'chapter-03',
    act: 1,
  },
  {
    id: 'concept-lists',
    name: '列表 (Lists)',
    threeKingdomsName: '十面埋伏',
    description: '列表就像一份点将册，可以装很多武将的名字。',
    example: `# [] = 方括号，创建列表；元素用逗号隔开
heroes = ["刘备", "关羽", "张飞"]
# [0] = 用编号取元素。编号从 0 开始！0是第一个
print(heroes[0])
# len() = length(长度)的缩写，数出列表有几个元素
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
    example: `# for = "对于每一个"，开始循环
# i = 当前轮次的编号（你可以叫别的名字如 num）
# in = "从...里取"
# range(3) = 产生 0, 1, 2 三个数
# : = 冒号，下面缩进的代码会重复执行
for i in range(3):
    # 缩进 = 这行在循环内，每轮都执行
    # 逗号隔开多个内容，Python 自动加空格拼在一起输出
    # i+1 是因为 range 从0开始，显示要从1开始
    print("第", i + 1, "箭！")

# 也可以逐个取出列表里的元素
generals = ["赵云", "马超", "黄忠"]
# g = 每轮取出的元素（这里 g 是文字，不是数字）
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
# while = "当...的时候一直做"
# captures < 3 = 条件（小于3就继续）
# : = 冒号，下面缩进的代码是循环体
while captures < 3:
    # += 是简写：captures += 1 等于 captures = captures + 1
    # 这行非常重要！不更新 captures 就会死循环
    captures += 1
    print("第", captures, "次擒获孟获")
# 不缩进 = 这行在循环外面，循环结束后才执行
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
    example: `# 找出 bug 并修复
name = "关羽"
# 错误写法: print(nama) ← 变量名拼错了！
# Python 会报错: NameError: name 'nama' is not defined
# 意思是：Python 不认识 nama 这个名字
print(name)  # 正确！用的是 name 而不是 nama`,
    expectedOutput: `关羽`,
    unlockedByChapter: 'chapter-07',
    act: 2,
  },
  {
    id: 'concept-list-ops',
    name: '列表操作',
    threeKingdomsName: '草船借箭',
    description: 'append就像草船借箭，一批批地收集数据。',
    example: `# [] 不放任何元素 = 创建一个空列表
arrows = []
# .append() = 点号表示"对这个列表做操作"
# append 往列表末尾添加一个元素
arrows.append("第一批箭")
arrows.append("第二批箭")
arrows.append("第三批箭")
# 逗号隔开多个内容，Python 自动拼在一起输出
# len() 数出列表有几个元素
print("共借到", len(arrows), "批箭")
# .pop() 取出并删除最后一个元素，并把它"返回"
# 返回 = 把取出的值交给你，可以存进变量
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
    example: `# + 拼接多段文字
message = "火" + "攻" + "曹营"
print(message)
# str() = 把数字变成文字（string 的缩写）
# 文字和数字不能直接用 + 拼，要先用 str() 转换
# len() = 数出有几个字符
# str(len(message)) = 先算里面的 len 得到 4，再用 str 变成 "4"
print("密信长度：" + str(len(message)))
# [0] = 取第 0 个字符（编号从0开始，和列表一样）
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
# enumerate() 同时给出编号 i 和内容 person
# i = 位置编号（从0开始），person = 该位置的内容
# 逗号隔开两个变量 = enumerate 每次给出两个值，分别存进 i 和 person
for i, person in enumerate(army):
    # == 是"是否相等"的比较（不是赋值的 =）
    if person == "阿斗":
        # 两层缩进 = 这行同时在 for 和 if 里面
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
    example: `# 用列表模拟栈（后进先出）
stack = []
# .append() = 压入栈顶（放到最上面）
stack.append("第一层伏兵")
stack.append("第二层伏兵")
stack.append("第三层伏兵")
# .pop() = 弹出栈顶（取走最上面的）
# 最后放进去的"第三层"最先被取出
print(stack.pop())`,
    expectedOutput: `第三层伏兵`,
    unlockedByChapter: 'chapter-11',
    act: 3,
  },
  {
    id: 'concept-queue',
    name: '队列 (Queue)',
    threeKingdomsName: '水淹七军',
    description: '队列就像排队过河：先来的先走。',
    example: `# from A import B = 从工具箱 A 里拿出工具 B
# deque = 适合做队列的容器（比普通列表快）
# collections 是 Python 自带的工具箱，不用安装
from collections import deque
# deque() 创建队列，传入一个列表来初始化内容
queue = deque(["于禁", "庞德", "曹仁"])
# .popleft() = 从队头取出（第一个来的先走）
# 注意是 popleft 不是 pop（pop 取的是最后一个）
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
    example: `# {} = 花括号创建字典（列表用[]，字典用{}）
# "键": "值" 成对出现，键是名字，值是内容
plans = {"第一计": "联吴抗曹", "第二计": "火烧赤壁"}
# 用键名取值：字典名["键名"]
print(plans["第一计"])
# len() 数出有几对 键-值
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
    example: `# class = 设计图纸，描述一种东西的属性和功能
# City = 图纸的名字（你自己起的）
class City:
    # def = 定义方法（类里面的函数叫"方法"）
    # __init__ = 创建对象时自动运行的"出厂设置"
    # self = "自己"，指向当前这个对象
    def __init__(self, name):
        # self._soldiers = 这个对象自己的属性
        # 下划线 _ 开头 = 约定"内部数据，外面别直接碰"
        self._soldiers = 0
        # self.name = name 就是"我的名字 = 传进来的名字"
        self.name = name
    # 方法：对象能做的事
    def show(self):
        print(self.name + "：城门大开")

# 用图纸造出一个对象：类名(参数)
xicheng = City("西城")
# 对象.方法() = 让这个对象执行方法
# 虽然 show(self) 定义里有 self，但调用时不用传
# Python 自动把 xicheng 传给 self
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
    # def = 定义方法（class 里的函数叫"方法"）
    def __init__(self):
        # 内部用字典 {} 存数据
        self.items = {}
    # 方法：添加物品（设置 键=物品名, 值=数量）
    # 调用 cart.add("粮草", 100) 时，self=cart, name="粮草", qty=100
    def add(self, name, qty):
        # dict[key] = value 往字典里写入一对键值
        # 注意：同名 key 会覆盖旧值，不是累加
        self.items[name] = qty
    # 方法：展示所有物品
    def show(self):
        # .items() 取出字典里每一对(键, 值)
        # for 循环遍历每一对 k(键/物品名), v(值/数量)
        for k, v in self.items.items():
            # str(v) 把数字转成文字再拼接
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
