'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PythonConcept } from '@/lib/levels/concepts';
import { TTSButton } from '@/components/ui/TTSButton';

interface ConceptLessonProps {
  concept: PythonConcept;
  chapterTitle: string;
  onReady: () => void;
}

export function ConceptLesson({ concept, chapterTitle, onReady }: ConceptLessonProps) {
  const [step, setStep] = useState(0);

  // Three steps: 1) What is it, 2) How it works (code example), 3) Ready to battle
  const steps = [
    {
      title: `兵书：${concept.threeKingdomsName}`,
      subtitle: concept.name,
      content: concept.description,
      detail: getDetailedExplanation(concept.id),
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: concept.example,
      output: concept.expectedOutput,
    },
  ];

  const currentStep = steps[step];
  const isLastStep = step >= steps.length - 1;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(44, 24, 16, 0.85)' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className="w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden border-2"
        style={{
          backgroundColor: 'var(--color-parchment)',
          borderColor: 'var(--color-gold)',
        }}
        initial={{ scale: 0.9, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 20 }}
      >
        {/* Header */}
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ backgroundColor: 'var(--color-shu-red)' }}
        >
          <div>
            <p className="text-white/70 text-sm" style={{ fontFamily: 'serif' }}>
              {chapterTitle} — 战前学习
            </p>
            <h2 className="text-white text-xl font-bold" style={{ fontFamily: 'serif' }}>
              {currentStep.title}
            </h2>
          </div>
          <div className="flex gap-1.5">
            {steps.map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {'subtitle' in currentStep && (
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-lg font-bold"
                style={{ color: 'var(--color-ink)', fontFamily: 'serif' }}
              >
                {currentStep.subtitle}
              </p>
              <TTSButton
                text={getTTSText(currentStep, concept)}
                label="听讲解"
                size="sm"
              />
            </div>
          )}

          {'content' in currentStep && currentStep.content && (
            <div className="space-y-3">
              <p
                className="text-base leading-relaxed"
                style={{ color: 'var(--color-ink)' }}
              >
                {currentStep.content}
              </p>
              {'detail' in currentStep && currentStep.detail && (
                <div
                  className="rounded-xl p-4 text-sm leading-relaxed space-y-2"
                  style={{
                    backgroundColor: 'rgba(212, 168, 67, 0.1)',
                    color: 'var(--color-ink)',
                  }}
                >
                  {currentStep.detail.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {'code' in currentStep && currentStep.code && (
            <div className="space-y-3">
              {/* Code example */}
              <div
                className="rounded-xl p-4 font-mono text-base overflow-x-auto"
                style={{
                  backgroundColor: '#1e1e2e',
                  color: '#cdd6f4',
                }}
              >
                <pre className="whitespace-pre-wrap">{highlightPython(currentStep.code)}</pre>
              </div>

              {/* Output */}
              {'output' in currentStep && currentStep.output && (
                <div>
                  <p
                    className="text-sm font-bold mb-1"
                    style={{ color: 'var(--color-bamboo)', fontFamily: 'serif' }}
                  >
                    运行结果：
                  </p>
                  <div
                    className="rounded-lg p-3 font-mono text-sm"
                    style={{
                      backgroundColor: 'rgba(45, 106, 79, 0.1)',
                      color: 'var(--color-wu-green)',
                      border: '1px solid rgba(45, 106, 79, 0.2)',
                    }}
                  >
                    <pre className="whitespace-pre-wrap">{currentStep.output}</pre>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer buttons */}
        <div className="px-6 py-4 flex justify-between items-center border-t" style={{ borderColor: 'var(--color-bamboo)' }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2 rounded-lg text-base font-bold cursor-pointer transition-colors"
              style={{
                color: 'var(--color-bamboo)',
                fontFamily: 'serif',
              }}
            >
              上一步
            </button>
          ) : (
            <button
              onClick={onReady}
              className="px-5 py-2 rounded-lg text-base cursor-pointer transition-colors"
              style={{
                color: 'var(--color-bamboo)',
                fontFamily: 'serif',
              }}
            >
              跳过学习
            </button>
          )}

          <button
            onClick={isLastStep ? onReady : () => setStep(step + 1)}
            className="px-8 py-2.5 rounded-lg text-white font-bold text-base cursor-pointer transition-transform active:scale-95"
            style={{
              backgroundColor: isLastStep ? 'var(--color-shu-red)' : 'var(--color-gold)',
              color: isLastStep ? 'white' : 'var(--color-ink)',
              fontFamily: 'serif',
            }}
          >
            {isLastStep ? '开始战斗！' : '继续'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

/** Build TTS text from the current step content */
function getTTSText(step: Record<string, unknown>, concept: PythonConcept): string {
  if ('content' in step && step.content) {
    const detail = 'detail' in step && Array.isArray(step.detail) ? (step.detail as string[]).join('。') : '';
    return `${concept.name}。${step.content}。${detail}`;
  }
  if ('code' in step && step.code) {
    return `来看看代码怎么写。${concept.description}。运行这段代码后，输出结果是：${concept.expectedOutput}`;
  }
  return concept.description;
}

/** Simple Python syntax highlighting */
function highlightPython(code: string): React.ReactNode {
  // This is a simple approach - just return the code as-is
  // Real highlighting would use regex replacement
  return code;
}

/** Detailed explanations per concept for kids */
function getDetailedExplanation(conceptId: string): string[] {
  const explanations: Record<string, string[]> = {
    'concept-print': [
      'print() 是 Python 里最基础的命令，它能把括号里的内容显示到屏幕上。',
      '要显示文字，需要用引号把文字包起来，比如 print("你好")。引号就像一个"包装纸"，告诉 Python 这是一段文字。',
      '你也可以用 print() 显示数字或算术结果，比如 print(1 + 2) 会显示 3。数字不需要加引号。',
      '每写一行 print()，输出就会换一行显示——就像每射一支箭，箭就落在不同的位置。',
    ],
    'concept-variables': [
      '变量就像一个有名字的盒子。你可以把任何东西放进去，之后用名字就能取出来。',
      '创建变量用等号 =，比如 name = "刘备"，就是把"刘备"放进叫 name 的盒子里。注意：这里的 = 是"放进去"的意思，不是数学里的"等于"。',
      '变量的名字你可以自己起，但有几个规则：只能用英文字母、数字和下划线（_），不能以数字开头。比如 hero_name 可以，但 1hero 不行。',
      '用 + 号可以把多段文字拼在一起，比如 name + "出击！" 就会变成 "刘备出击！"。这叫做字符串拼接。',
    ],
    'concept-functions': [
      '函数就像一本兵法手册。你先写好步骤（定义函数），以后随时可以翻开来用（调用函数）。',
      '写法是：def 函数名(参数):，然后下面缩进写函数要做的事。比如 def attack(name): 就定义了一个叫 attack 的函数，name 是它需要的"原料"。',
      '参数就像函数的"输入口"——你每次调用时传入不同的值，函数就会用那个值来执行。比如 attack("关羽") 和 attack("张飞") 虽然用的是同一个函数，但会输出不同的结果。',
      '定义函数不会立刻执行里面的代码！必须用 函数名() 来"调用"它，代码才会跑起来。',
    ],
    'concept-if-else': [
      'if/else 让程序学会"做判断"——根据不同情况，选择不同的路走。就像军师看到不同战况，会下达不同的命令。',
      '写法是：if 条件:，条件成立（True）就执行下面缩进的代码。比如 if soldiers > 1000: 意思是"如果士兵数量超过一千"。',
      'else 是"否则"——当 if 的条件不成立时执行。你也可以用 elif（else if 的缩写）来判断更多情况，比如 elif soldiers > 500: 表示"否则如果超过五百"。',
      '常用的比较符号：> 大于、< 小于、== 等于、!= 不等于、>= 大于等于、<= 小于等于。注意：== 是比较（是不是相等），= 是赋值（放进盒子），别搞混！',
    ],
    'concept-lists': [
      '列表就像一份名单（点将册），可以把很多东西按顺序排在一起。',
      '用方括号 [] 创建列表，里面的元素用逗号隔开，比如 heroes = ["关羽", "张飞", "赵云"]。',
      '列表里的每个元素都有一个编号（叫做"索引"），从 0 开始数！所以 heroes[0] 是"关羽"，heroes[1] 是"张飞"，heroes[2] 是"赵云"。',
      'len() 可以数出列表里有多少个元素，比如 len(heroes) 会得到 3。append() 可以往列表末尾添加新元素，比如 heroes.append("马超")。',
    ],
    'concept-for-loop': [
      '【语法模板】for 变量名 in 序列:（注意最后的冒号！），换行后缩进 4 格写要重复的代码。模板：\nfor ___ in ___:\n    要重复的代码',
      '【什么是 range()】range(5) 生成 0, 1, 2, 3, 4（从 0 开始，不包含 5）。range(3) 就是 0, 1, 2。想从 1 开始？用 range(1, 4)，产生 1, 2, 3（前面包含，后面不包含）。',
      '【什么是 i】for i in range(5): 里的 i 是一个变量名，每轮循环自动变成下一个数字（第一轮 i=0，第二轮 i=1……）。i 这个名字不是固定的！你可以叫 num、count 或任何名字。',
      '【遍历列表】for 还能直接取出列表里的每个元素：for name in ["关羽", "张飞"]: 第一轮 name="关羽"，第二轮 name="张飞"。变量名要和后面使用的名字一致。',
      '【缩进很重要】冒号后面换行、缩进 4 格的代码是"循环体"（要重复的部分）。不缩进的代码不属于循环，只在循环结束后执行一次。',
      '【print 小技巧】print("第", i, "箭") 用逗号隔开多个内容，Python 会自动加空格拼在一起输出。这样就不用管文字和数字的转换了！',
    ],
    'concept-while-loop': [
      '【语法模板】while 条件:（注意冒号！），换行缩进写要重复的代码。模板：\n变量 = 初始值\nwhile 条件:\n    要重复的代码\n    更新变量',
      '【执行过程】Python 这样执行 while：① 检查条件 → ② 条件成立就执行循环体 → ③ 回到①再检查 → ④ 条件不成立就跳出，往下走。',
      '【三步口诀】写 while 循环记住三步：① 初始化（设初始值，如 captures = 0）→ ② 判断条件（如 captures < 3）→ ③ 更新变量（如 captures += 1）。少了第③步就会死循环！',
      '【和 for 的区别】for 适合"我知道要重复几次"（比如"重复5次"、"遍历列表"）。while 适合"不确定几次，满足条件才停"（比如"血量到0才停"、"猜对了才停"）。',
      '【+= 是什么】captures += 1 是 captures = captures + 1 的简写，意思是"在原来基础上加 1"。类似的还有 -= (减)、*= (乘)。',
    ],
    'concept-debug': [
      '程序员写的代码有错误，就叫"bug"（虫子）。找出并修复这些错误的过程叫"debug"（捉虫子）。',
      '常见的 bug 类型：① 拼写错误——比如把变量名 name 写成 nama，Python 就不认识了；② 缩进错误——该缩进的没缩进，不该缩进的缩了；③ 逻辑错误——代码能跑但结果不对。',
      '遇到错误时，Python 会给你一条"错误信息"，告诉你哪一行出了问题、是什么类型的错误。学会读错误信息是debug最重要的技能！',
      '调试小技巧：在可疑的地方加 print() 输出变量的值，看看是不是你预期的。就像华佗诊脉，先找到"毒"在哪里，再对症下药。',
    ],
    'concept-list-ops': [
      '列表创建后不是固定不变的，你可以往里面添加、删除、修改元素——就像一份名单可以随时更新。',
      'append(x) 在列表末尾添加一个元素 x。比如 arrows.append("火箭") 就是在列表最后面加上"火箭"。',
      'pop() 取出并删除列表最后一个元素。pop(0) 则取出第一个。就像从队伍末尾或开头叫走一个人。',
      'len(列表) 返回列表里有多少个元素。这在循环和条件判断中经常用到，比如 while len(arrows) < 10: 表示"箭不够10支就继续收集"。',
    ],
    'concept-strings': [
      '字符串就是一串文字，用引号包起来。单引号 \'你好\' 和双引号 "你好" 效果一样。',
      '用 + 号可以把两段文字拼在一起，这叫"拼接"。比如 "火" + "攻" 得到 "火攻"。注意：文字和数字不能直接拼，要先用 str() 把数字变成文字。',
      'len(文字) 可以数出文字有多少个字符。比如 len("火攻曹营") 得到 4。',
      '你可以用 [] 取出文字中某个位置的字符，编号从 0 开始。比如 "火攻曹营"[0] 是 "火"，[1] 是 "攻"。这和列表的索引规则一样！',
    ],
    'concept-search': [
      '搜索就是在一堆数据中找到你要的那一个——就像赵云在百万军中找阿斗。',
      '最基本的方法是"逐个查找"：用 for 循环一个一个看，配合 if 判断是不是目标。比如：for person in army: 再加 if person == "阿斗": 就能找到。',
      '【进阶】如果还想知道"在第几个位置找到的"，就用 enumerate()。for i, person in enumerate(army): 会同时给你编号 i（从0开始）和内容 person。i 就是位置编号。',
      'for + if 的组合是编程中最常见的模式——"遍历每个元素，找到符合条件的那个"。以后你会经常用到！',
    ],
    'concept-stack': [
      '栈是一种数据结构，规则是"后进先出"（LIFO）——最后放进去的，最先被取出来。就像叠盘子：最后放上去的盘子在最上面，最先被拿走。',
      'Python 里用列表就能模拟栈：append() 相当于把东西"压入"栈顶，pop() 相当于从栈顶"弹出"。',
      '栈在编程里很常见：浏览器的"后退"按钮就是一个栈——你访问的每个网页压入栈，点"后退"就弹出最近的那个。',
    ],
    'concept-queue': [
      '队列是另一种数据结构，规则是"先进先出"（FIFO）——最先排队的人最先被服务。就像排队买饭，先来的先买。',
      '【什么是 import】Python 有很多"工具箱"（模块），用 from ... import ... 就能把需要的工具拿出来用。这里 from collections import deque 就是从 collections 工具箱里拿出 deque 这个工具。',
      'deque（双端队列）的用法：append() 从队尾加入，popleft() 从队头取出。这样就实现了"先来先走"。',
      '栈 vs 队列：栈像叠盘子（后进先出），队列像排队（先进先出）。选哪个取决于你的问题需要哪种顺序。',
    ],
    'concept-dict': [
      '字典用花括号 {} 创建，里面是一对一对的"键: 值"。键就像锦囊的名字，值就是里面的内容。',
      '取值方式：用 字典名["键名"] 来取出对应的值。比如 plans["第一计"] 就能取出"联吴抗曹"。',
      '和列表的区别：列表用数字编号（0, 1, 2...）来找东西，字典用名字（键）来找。当你需要"按名字查找"时，字典比列表方便得多。',
      '添加新内容直接赋值：plans["第三计"] = "草船借箭" 就往字典里加了一条新记录。',
    ],
    'concept-encapsulation': [
      '【第一层：class = 设计图纸】class City: 就是画了一张"城市"的设计图，描述城市有什么（数据）和能做什么（方法）。City("西城") 就是按图纸造出一个具体的城——这个具体的城叫"对象"。',
      '【第二层：__init__ 和 self】__init__ 是"出厂设置"——创建对象时自动运行，用来设置初始属性。self 就是"自己"的意思，self.name = name 是说"我的名字是传进来的那个名字"。',
      '【封装的核心】把数据和操作包在一起，外面只能通过方法（如 show()）来使用，不需要知道内部怎么实现。就像空城计——外面只看到城门大开，里面有多少兵完全不知道。',
      '变量名前加下划线（如 self._soldiers）是一种约定，告诉别人"这是内部数据，请用方法来操作，别直接动"。',
    ],
    'concept-custom-ds': [
      '当 Python 内置的列表、字典不够用时，你可以用 class 组合它们，创造自己的数据结构。就像诸葛亮发明木牛流马——用已有的材料造出新工具。',
      '方法（def）让你的数据结构有了"能力"：add() 负责添加数据、show() 负责显示内容。你可以自己定义任意多的方法——你来决定它能做什么。',
      'for k, v in self.items.items(): 这里 .items() 是字典的方法，会把每一对"键和值"都取出来。k 代表键（物品名），v 代表值（数量）。',
    ],
  };

  return explanations[conceptId] || [
    '这是一个新的编程概念，军师会在接下来的战斗中教你如何使用。',
    '仔细看代码示例，试着理解每一行在做什么。',
  ];
}
