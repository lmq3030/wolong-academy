'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PythonConcept } from '@/lib/levels/concepts';
import { TTSButton } from '@/components/ui/TTSButton';

/* ──────────────────────────────────────────────────────────────
   Step data model — each step can contain ONE OR MORE content types
   that the renderer checks with 'key' in step.
   ────────────────────────────────────────────────────────────── */
interface LessonStep {
  title: string;
  subtitle?: string;
  // text content
  content?: string;
  detail?: string[];
  // code example
  code?: string;
  output?: string;
  // execution trace table
  trace?: { headers: string[]; rows: string[][] };
  // code breakdown (annotated parts)
  breakdown?: { code: string; label: string }[];
  // image diagram
  image?: string;
  imageCaption?: string;
}

/* ──────────────────────────────────────────────────────────────
   Props
   ────────────────────────────────────────────────────────────── */
interface ConceptLessonProps {
  concept: PythonConcept;
  chapterTitle: string;
  onReady: () => void;
}

export function ConceptLesson({ concept, chapterTitle, onReady }: ConceptLessonProps) {
  const steps = getConceptSteps(concept);
  const [step, setStep] = useState(0);

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
        className="w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden border-2 max-h-[90vh] flex flex-col"
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
          className="flex-none px-6 py-4 flex items-center justify-between"
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
                className={`w-2.5 h-2.5 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`}
              />
            ))}
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {currentStep.subtitle && (
            <div className="flex items-center justify-between">
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

          {/* Text content */}
          {currentStep.content && (
            <p
              className="text-base leading-relaxed"
              style={{ color: 'var(--color-ink)' }}
            >
              {currentStep.content}
            </p>
          )}

          {/* Detail paragraphs */}
          {currentStep.detail && currentStep.detail.length > 0 && (
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

          {/* Code breakdown (annotated parts) */}
          {currentStep.breakdown && (
            <div className="space-y-2">
              {currentStep.breakdown.map((part, i) => (
                <div key={i} className="flex items-start gap-3">
                  <code
                    className="flex-none px-2 py-1 rounded font-mono text-sm font-bold"
                    style={{ backgroundColor: '#1e1e2e', color: '#f9e2af' }}
                  >
                    {part.code}
                  </code>
                  <span className="text-sm leading-relaxed" style={{ color: 'var(--color-ink)' }}>
                    {part.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Execution trace table */}
          {currentStep.trace && (
            <div className="overflow-x-auto rounded-xl border" style={{ borderColor: 'var(--color-bamboo)' }}>
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: 'rgba(212, 168, 67, 0.15)' }}>
                    {currentStep.trace.headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2 text-left font-bold border-b"
                        style={{ color: 'var(--color-ink)', borderColor: 'var(--color-bamboo)', fontFamily: 'serif' }}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {currentStep.trace.rows.map((row, ri) => (
                    <tr key={ri} className={ri % 2 === 0 ? '' : 'bg-white/30'}>
                      {row.map((cell, ci) => (
                        <td
                          key={ci}
                          className="px-3 py-1.5 border-b font-mono text-xs"
                          style={{ color: 'var(--color-ink)', borderColor: 'rgba(139,119,101,0.2)' }}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Image diagram */}
          {currentStep.image && (
            <div className="space-y-2">
              <img
                src={currentStep.image}
                alt={currentStep.imageCaption || '概念图解'}
                className="w-full rounded-xl border"
                style={{ borderColor: 'var(--color-bamboo)' }}
              />
              {currentStep.imageCaption && (
                <p className="text-xs text-center" style={{ color: 'var(--color-bamboo)' }}>
                  {currentStep.imageCaption}
                </p>
              )}
            </div>
          )}

          {/* Code example */}
          {currentStep.code && (
            <div className="space-y-3">
              <div
                className="rounded-xl p-4 font-mono text-sm overflow-x-auto"
                style={{ backgroundColor: '#1e1e2e', color: '#cdd6f4' }}
              >
                <pre className="whitespace-pre-wrap">{currentStep.code}</pre>
              </div>
              {currentStep.output && (
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
        <div className="flex-none px-6 py-4 flex justify-between items-center border-t" style={{ borderColor: 'var(--color-bamboo)' }}>
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="px-5 py-2 rounded-lg text-base font-bold cursor-pointer transition-colors"
              style={{ color: 'var(--color-bamboo)', fontFamily: 'serif' }}
            >
              上一步
            </button>
          ) : (
            <button
              onClick={onReady}
              className="px-5 py-2 rounded-lg text-base cursor-pointer transition-colors"
              style={{ color: 'var(--color-bamboo)', fontFamily: 'serif' }}
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

/* ──────────────────────────────────────────────────────────────
   TTS helper
   ────────────────────────────────────────────────────────────── */
function getTTSText(step: LessonStep, concept: PythonConcept): string {
  const parts: string[] = [];
  if (step.content) parts.push(step.content);
  if (step.detail) parts.push(step.detail.join('。'));
  if (step.breakdown) parts.push(step.breakdown.map(b => `${b.code}：${b.label}`).join('。'));
  if (step.code) parts.push(`代码示例的运行结果是：${step.output || concept.expectedOutput}`);
  return parts.length > 0 ? parts.join('。') : concept.description;
}

/* ══════════════════════════════════════════════════════════════
   STEP BUILDERS — per concept
   Each concept returns a tailored array of LessonSteps.
   Simple concepts: 2-3 steps. Complex concepts: 4-6 steps.
   ══════════════════════════════════════════════════════════════ */
function getConceptSteps(concept: PythonConcept): LessonStep[] {
  const builder = conceptStepBuilders[concept.id];
  if (builder) return builder(concept);

  // Fallback for concepts without custom steps
  return [
    {
      title: `兵书：${concept.threeKingdomsName}`,
      subtitle: concept.name,
      content: concept.description,
      detail: [
        '这是一个新的编程概念，军师会在接下来的战斗中教你如何使用。',
        '仔细看代码示例，试着理解每一行在做什么。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: concept.example,
      output: concept.expectedOutput,
    },
  ];
}

const conceptStepBuilders: Record<string, (c: PythonConcept) => LessonStep[]> = {

  /* ─────────── print ─────────── */
  'concept-print': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有 print 会怎样？',
      content: '看看这段代码——它算了 1+2，但运行后屏幕上什么都没有！',
      code: '# 没有 print 的"笨办法"\n1 + 2\n"天下英雄，使君与操耳"\n# 运行后……屏幕上什么都没有！\n# Python 算了，但不告诉你结果',
      detail: [
        '代码默默地执行了，但你什么都看不到。就像军师写了密信却没派人送出去——白写了！',
        'print() 就是"送信人"——它能把括号里的内容显示到屏幕上，让你看到结果。',
      ],
    },
    {
      title: '逐词拆解 print()',
      subtitle: 'print("你好") 每个部分是什么？',
      breakdown: [
        { code: 'print', label: '命令名字——告诉 Python"请显示"' },
        { code: '(  )', label: '括号——把要显示的内容放在这里面' },
        { code: '"你好"', label: '引号里的文字——引号是"包装纸"，告诉 Python 这是一段文字，不是命令' },
      ],
      detail: [
        '文字必须用引号包起来（单引号 \'你好\' 或双引号 "你好" 都行），否则 Python 会以为你在写代码命令。',
        '数字不需要引号：print(123) 直接写数字就行。print(1 + 2) 会先算出 3，再显示 3。',
        '每写一行 print()，输出就会换一行显示——就像每射一支箭，箭落在不同的位置。',
        '代码中以 # 开头的灰色文字是"注释"——写给人看的说明，Python 会完全忽略它。你会在后面的示例中经常看到 # 注释。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── variables ─────────── */
  'concept-variables': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有变量的笨办法',
      content: '如果没有变量，每次用到"赵云"都要重新写一遍。想换成"关羽"？要改好多处！',
      code: '# 笨办法：到处写死名字\nprint("赵云的武器是龙胆亮银枪")\nprint("赵云出击！")\nprint("赵云大获全胜！")\n# 想换成关羽？要改 3 个地方！漏改一个就出 bug',
      detail: [
        '如果名字出现了 100 次呢？改起来太痛苦了。而且很容易漏改，导致一半写"赵云"一半写"关羽"。',
        '变量就是解决方案：把名字存进一个"盒子"，以后只用盒子的名字。换人？只改一处就够了！',
      ],
    },
    {
      title: '逐词拆解',
      subtitle: 'hero = "赵云" 每个部分是什么？',
      breakdown: [
        { code: 'hero', label: '变量名——你自己起的名字。规则：只能用英文字母、数字、下划线(_)，不能以数字开头' },
        { code: '=', label: '赋值号——不是数学的"等于"！意思是"把右边的东西放进左边的盒子里"' },
        { code: '"赵云"', label: '值——要放进盒子的内容。加引号表示这是文字' },
      ],
      detail: [
        '为什么 = 不是"等于"？因为在 Python 里，= 是"放进去"的动作。数学里的等于用 == （两个等号）。',
        '变量名随便起，但要有意义：hero 比 x 好懂。Python 区分大小写：Hero 和 hero 是两个不同的盒子！',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
      detail: [
        '+ 号可以把多段文字拼在一起（叫"字符串拼接"）。hero + "的武器是" + weapon 就是把三段文字拼成一句话。',
      ],
    },
  ],

  /* ─────────── functions ─────────── */
  'concept-functions': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有函数的笨办法',
      content: '想让 3 个武将喊战号？没有函数，你得复制粘贴同样的代码 3 次：',
      code: '# 笨办法：复制粘贴 3 次\nprint("张飞" + "在此，谁敢一战！")\nprint("关羽" + "在此，谁敢一战！")\nprint("赵云" + "在此，谁敢一战！")\n# 要改战号？3 个地方都要改！',
      detail: [
        '如果有 10 个武将呢？复制 10 次！如果战号要改？每个都得改！',
        '函数就是解决方案：把代码写成一套"兵法"，定义一次，传入不同的名字就能重复使用。',
      ],
    },
    {
      title: '逐词拆解',
      subtitle: 'def war_cry(name): 每个部分是什么？',
      breakdown: [
        { code: 'def', label: '关键字——告诉 Python"我要定义一个函数"（define 的缩写）' },
        { code: 'war_cry', label: '函数名——你自己起的名字，以后用这个名字来调用它' },
        { code: '(name)', label: '参数——函数需要的"原料"。调用时你传什么值进来，name 就代表什么' },
        { code: ':', label: '冒号——表示"下面缩进的代码是函数的内容"' },
      ],
      detail: [
        '定义函数时代码不会执行！必须"调用"才会跑。调用方式：war_cry("张飞")，括号里放你要传的值。',
        '参数就像一个临时盒子：调用 war_cry("张飞") 时，name 盒子里装的是"张飞"；调用 war_cry("关羽") 时，装的是"关羽"。',
        '函数体（冒号后面缩进的部分）是函数要做的事。什么是"缩进"？就是在每行代码前面加 4 个空格，让它们"往右缩进去"。这样 Python 就知道这些代码"属于"这个函数。按一次 Tab 键就能自动缩进 4 格。后面学的 if 和 for 也会用同样的缩进规则。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── if/else ─────────── */
  'concept-if-else': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有 if/else 的笨办法',
      content: '没有 if/else，程序每次都只能做同一件事——不管敌人多少，都正面打：',
      code: '# 笨办法：不管情况，永远正面冲\nprint("正面迎战！")\n# 如果只有 100 个兵呢？照样冲……全军覆没！\n# 我们需要让程序"看情况决定"',
      detail: [
        '没有判断能力的程序就像一个只会冲锋的莽夫——不管敌人 1 万还是 10 个，都傻冲。',
        'if/else 让程序学会"做判断"：兵多就正面打，兵少就用计谋。就像军师看到敌情后选择策略。',
      ],
    },
    {
      title: '逐词拆解',
      subtitle: 'if soldiers > 1000: 每个部分是什么？',
      breakdown: [
        { code: 'if', label: '关键字——"如果"' },
        { code: 'soldiers > 1000', label: '条件——一个"是或否"的问题。Python 会计算出 True（真，条件成立）或 False（假，条件不成立）。True 和 False 是 Python 的特殊值，叫"布尔值"' },
        { code: ':', label: '冒号——"那么就做下面缩进的事"' },
        { code: 'else:', label: '"否则"——条件不成立时做的事。else 后面也有冒号和缩进' },
      ],
      detail: [
        '常用的比较：> 大于、< 小于、== 等于（注意是两个等号！）、!= 不等于、>= 大于等于、<= 小于等于。',
        '== 和 = 千万别搞混：= 是"放进盒子"（赋值），== 是"比一比是不是相等"（比较）。',
        '还有 elif（else if 的缩写）——"否则如果"，可以判断更多种情况，就像兵法里有好几套备选方案。',
      ],
    },
    {
      title: '执行追踪',
      subtitle: '不同的兵力，不同的结果',
      content: '看看 Python 在不同兵力下怎么做判断：',
      trace: {
        headers: ['soldiers', 'soldiers > 1000 ?', '走哪条路？', '输出'],
        rows: [
          ['500', '500 > 1000 → False', 'else 分支', '使用空城计！'],
          ['1500', '1500 > 1000 → True', 'if 分支', '正面迎战！'],
          ['1000', '1000 > 1000 → False', 'else 分支', '使用空城计！'],
        ],
      },
      detail: [
        '注意第 3 行：1000 > 1000 是 False（不成立），因为 > 是"严格大于"，1000 并不大于 1000。如果想包含等于，用 >= （大于等于）。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── lists ─────────── */
  'concept-lists': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有列表的笨办法',
      content: '想存 5 个武将的名字？没有列表，你得给每个人单独建一个变量：',
      code: '# 笨办法：一个人一个变量\nhero1 = "刘备"\nhero2 = "关羽"\nhero3 = "张飞"\nhero4 = "赵云"\nhero5 = "马超"\n# 想数有几个人？手动数！想加人？再建 hero6！',
      detail: [
        '5 个还好，100 个武将呢？hero1 到 hero100？而且你没法用循环遍历它们！',
        '列表就是解决方案：一个变量装所有人，用编号就能找到任意一个，还能用 for 循环遍历。',
      ],
    },
    {
      title: '逐词拆解',
      subtitle: '列表的每个部分是什么？',
      breakdown: [
        { code: '[ ]', label: '方括号——创建列表用的"容器"符号' },
        { code: '"刘备", "关羽", "张飞"', label: '元素——列表里的每样东西，用逗号隔开' },
        { code: 'heroes[0]', label: '索引——用编号取出某个元素。编号从 0 开始！' },
      ],
      detail: [
        '为什么编号从 0 开始？这是几乎所有编程语言的规定。第 1 个元素编号是 0，第 2 个是 1，第 3 个是 2……',
        'len(heroes) 可以数出列表里有几个元素。len 是 length（长度）的缩写。',
        'heroes.append("马超") 可以在列表末尾加一个人。注意这个"点"语法：列表名.操作名()——点(.)的意思是"对这个列表做某个操作"。以后你会经常看到这种 xxx.yyy() 的写法。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ═══════════ FOR LOOP — 6 steps ═══════════ */
  'concept-for-loop': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '什么是"循环"？',
      content: '如果你要写 5 遍 print("射箭！")，一行一行地写太累了。"循环"就是告诉电脑："这件事，帮我重复做好几次！"',
      detail: [
        '没有循环的写法：print("射箭！") print("射箭！") print("射箭！") print("射箭！") print("射箭！") ← 5行一模一样的代码！',
        '有了 for 循环，只写 2 行就搞定：for i in range(5): print("射箭！")。电脑自动帮你重复 5 次。',
        'for 循环就像连弩——装好箭，告诉它"射 5 次"，它就自动一支一支地射出去。',
      ],
    },
    {
      title: '逐词拆解',
      subtitle: 'for i in range(5): 每个词是什么意思？',
      breakdown: [
        { code: 'for', label: '"对于每一个"——告诉 Python 要开始循环了' },
        { code: 'i', label: '"当前是第几轮"的标记。i 不是固定的名字！你可以叫 num、turn、x——随你起。程序员习惯用 i（index 的缩写，意思是"编号"），但它就是个普通变量' },
        { code: 'in', label: '"从……里面取"——每次从右边的数字串里取出一个给 i' },
        { code: 'range(5)', label: '"数字生成器"——产生一串数字：0, 1, 2, 3, 4。一共 5 个数，从 0 开始，不包含 5' },
        { code: ':', label: '冒号——"接下来缩进的代码就是要重复做的事"' },
      ],
      detail: [
        '连起来读：for i in range(5): = "对于 range(5) 生成的每一个数字，把它叫做 i，然后执行下面的代码"。',
        '为什么从 0 开始？这是 Python（和大多数编程语言）的习惯。range(5) = 0,1,2,3,4 而不是 1,2,3,4,5。',
        '如果你想从 1 开始呢？用 range(1, 6)，产生 1,2,3,4,5。规则是：range(起点, 终点)，包含起点，不包含终点。',
      ],
      image: '/assets/concepts/range-generator.png',
      imageCaption: 'range() 就像一台数字生成器，自动产生一串数字',
    },
    {
      title: '逐轮执行追踪',
      subtitle: '电脑执行时，每一轮发生了什么？',
      content: '以 for i in range(5): print("第", i+1, "箭！") 为例，电脑会这样一轮一轮地执行：',
      trace: {
        headers: ['轮次', 'i 的值', 'i + 1', '屏幕输出'],
        rows: [
          ['第 1 轮', '0', '1', '第 1 箭！'],
          ['第 2 轮', '1', '2', '第 2 箭！'],
          ['第 3 轮', '2', '3', '第 3 箭！'],
          ['第 4 轮', '3', '4', '第 4 箭！'],
          ['第 5 轮', '4', '5', '第 5 箭！'],
          ['结束', '没有更多数字了', '—', '（循环结束，往下走）'],
        ],
      },
      image: '/assets/concepts/for-loop-flow.png',
      imageCaption: 'for 循环的执行流程：从 i=0 开始，每轮自动换下一个数字',
      detail: [
        '每一轮，i 自动变成下一个数字。你不需要手动给 i 赋值，for 循环会自动帮你做。',
        '缩进的代码是"循环体"——每轮都会执行。不缩进的代码不属于循环，只在结束后执行一次。',
        'print("第", i+1, "箭！") 里的逗号是什么意思？逗号把多个内容隔开，Python 会把它们拼在一起输出，中间自动加空格。这样文字和数字可以直接混在一起打印，不用做转换。',
      ],
    },
    {
      title: '另一种用法：遍历列表',
      subtitle: '不用 range，直接取出列表里的每个元素',
      content: 'for 不只能配合数字使用。如果你有一个列表，for 可以一个一个地取出里面的元素：',
      code: 'generals = ["赵云", "马超", "黄忠"]\nfor g in generals:\n    print(g + "出击！")',
      output: '赵云出击！\n马超出击！\n黄忠出击！',
      detail: [
        '这里 g 是每轮取出的元素（不是数字编号）。第 1 轮 g="赵云"，第 2 轮 g="马超"，第 3 轮 g="黄忠"。',
        'g 这个名字也是你自己起的，叫 general、name、hero 都行，关键是和后面用到的名字保持一致。',
      ],
    },
    {
      title: '看看完整代码',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ═══════════ WHILE LOOP — 6 steps ═══════════ */
  'concept-while-loop': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: 'for 循环搞不定的情况',
      content: 'for 循环需要提前知道"重复几次"。但如果你不知道要重复几次呢？',
      code: '# 笨办法：不知道要擒几次，只能用 for 猜一个数\nfor i in range(10):  # 猜 10 次？也许 3 次就够了\n    print("擒获孟获！")\n# 问题：多跑了 7 次！或者猜少了，不够用',
      detail: [
        'for 循环像"点名"：名单上几个人就执行几次。但如果你不知道名单有多长呢？',
        'while 循环就是解决方案：不用猜次数，只需要说"条件满足就继续，不满足就停"。就像守城——一直守到敌人撤退为止。',
      ],
    },
    {
      title: '逐词拆解',
      subtitle: 'while captures < 3: 每个部分是什么？',
      breakdown: [
        { code: 'captures = 0', label: '第①步「初始化」——设定起点。captures 是一个计数器，从 0 开始' },
        { code: 'while', label: '关键字——"当……的时候，一直做"' },
        { code: 'captures < 3', label: '条件——一个"是或否"的问题。每轮开始前 Python 都会检查：captures 还小于 3 吗？' },
        { code: ':', label: '冒号——"接下来缩进的代码就是要重复做的事"' },
        { code: 'captures += 1', label: '第③步「更新」——每轮把 captures 加 1。这一步非常重要！忘了写就会死循环' },
      ],
      detail: [
        '写 while 循环的三步口诀：① 初始化变量（captures = 0）→ ② 写条件（captures < 3）→ ③ 更新变量（captures += 1）。',
        '+= 是简写：captures += 1 等于 captures = captures + 1，意思是"在原来基础上加 1"。类似的还有 -= (减)。',
      ],
    },
    {
      title: '逐轮执行追踪',
      subtitle: '电脑执行时，每一轮发生了什么？',
      content: '以 while captures < 3: 为例，看看 Python 怎么一步一步执行的：',
      trace: {
        headers: ['步骤', 'captures', '检查 captures < 3?', '执行？', '屏幕输出'],
        rows: [
          ['初始', '0', '0 < 3 → True ✓', '执行循环体', '第 1 次擒获孟获'],
          ['第 2 轮', '1', '1 < 3 → True ✓', '执行循环体', '第 2 次擒获孟获'],
          ['第 3 轮', '2', '2 < 3 → True ✓', '执行循环体', '第 3 次擒获孟获'],
          ['第 4 轮', '3', '3 < 3 → False ✗', '跳出循环！', '孟获服了！'],
        ],
      },
      detail: [
        '注意第 4 轮：captures 变成 3 后，3 < 3 不成立（False），所以 Python 跳出循环，执行循环外面的代码。',
        '如果你忘了写 captures += 1，captures 永远是 0，0 < 3 永远是 True，循环就永远不会停——这叫"死循环"！',
      ],
    },
    {
      title: 'for vs while 怎么选？',
      subtitle: '一张图帮你判断',
      content: '两种循环都能让代码重复执行，但适用场景不同：',
      image: '/assets/concepts/for-vs-while.png',
      imageCaption: 'for 自动换下一个（像翻卡片），while 靠条件判断（像红绿灯）',
      trace: {
        headers: ['', 'for 循环', 'while 循环'],
        rows: [
          ['什么时候用？', '知道要重复几次', '不知道几次，靠条件判断'],
          ['例子', '射 5 箭、遍历名单', '血量到 0 才停、猜对才停'],
          ['谁来"数数"？', 'range() 自动数', '你自己更新变量'],
          ['会死循环吗？', '不会（自动结束）', '可能！忘了更新变量就会'],
          ['语法', 'for x in range(n):', 'while 条件:'],
        ],
      },
    },
    {
      title: '看看完整代码',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── debug ─────────── */
  'concept-debug': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有 debug 的笨办法',
      content: '代码出错了怎么办？没有调试技巧，你只能瞎猜、随便改，改了可能更糟：',
      code: '# 笨办法：瞎猜哪里错了\nname = "关羽"\nprint(nama)  # 报错了！\n# 随便改……把 print 改成 prnt？\n# 越改越乱！不如学会"看报错信息"',
      detail: [
        '瞎猜就像蒙着眼睛治病——可能治好，但更可能治坏。',
        'Debug 就是解决方案：学会看 Python 的"报错信息"（就像医生的诊断书），精准定位 bug 在哪，对症下药。',
      ],
    },
    {
      title: '常见的 bug 类型',
      subtitle: '三种最容易犯的错误',
      detail: [
        '① 拼写错误（NameError）：把变量名 name 写成 nama，Python 不认识 nama，就会报错说"我不知道 nama 是啥"。',
        '② 缩进错误（IndentationError）：for/if/def 后面的代码忘了缩进，或者缩进的格数不一致。Python 靠缩进来判断"哪些代码属于循环/条件"。',
        '③ 逻辑错误：代码能跑，但结果不对。比如你想让 count 从 1 加到 5，但写成了 count - 1，结果越减越小。这种最难发现！',
      ],
    },
    {
      title: '遇到错误怎么办？',
      subtitle: '学会看"错误信息"',
      content: 'Python 报错时会告诉你：❶ 哪个文件、❷ 第几行、❸ 什么类型的错误。这就是你的"诊断报告"。',
      detail: [
        '调试小技巧：在可疑的地方加 print() 输出变量的值，看看是不是你预期的。',
        '比如循环里 count 不对？加一行 print("count是:", count) 就能看到每轮 count 到底是多少。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── list-ops ─────────── */
  'concept-list-ops': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有列表操作的笨办法',
      content: '想往名单里加一个人？没有 append，你得重新创建整个列表：',
      code: '# 笨办法：加个人要重写整个列表\narrows = ["第一批箭", "第二批箭"]\n# 想加第三批？重新写一遍：\narrows = ["第一批箭", "第二批箭", "第三批箭"]\n# 每次加/删都要重写，太累了！',
      detail: [
        '列表操作就是解决方案：append() 往末尾加、pop() 从末尾取、len() 数有几个——不用每次重建！',
      ],
    },
    {
      title: '逐个讲解操作',
      subtitle: '三个最常用的列表操作',
      breakdown: [
        { code: 'append(x)', label: '在列表末尾添加一个元素 x。就像在名单最后面加一行' },
        { code: 'pop()', label: '取出并删除最后一个元素，返回它的值。就像从队伍末尾叫走一个人' },
        { code: 'len(列表)', label: '返回列表里有多少个元素。len 是 length（长度）的缩写' },
      ],
      detail: [
        'pop() 不只取出来，还会从列表里删掉它！如果只想看不想删，用 列表[-1] 取最后一个（-1 表示倒数第 1 个，-2 表示倒数第 2 个）。',
        '这些操作可以组合使用：while len(arrows) < 10: arrows.append("箭") 表示"不够 10 支箭就继续加"。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── strings ─────────── */
  'concept-strings': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有字符串操作的笨办法',
      content: '想把两段话拼起来？想知道密信有多长？没有字符串操作，你只能手动数、手动拼：',
      code: '# 笨办法：手动拼接和计算\nprint("火攻曹营")  # 想加前缀？重写整句\nprint("密信长度：4")  # 手动数了4个字\nprint("第一个字：火")  # 手动找的\n# 如果内容变了，全都要重来！',
      detail: [
        '字符串操作就是解决方案：+ 拼接、len() 自动数长度、[0] 自动取第一个字——让 Python 帮你处理文字！',
      ],
    },
    {
      title: '什么是"字符串"？',
      subtitle: '一串文字的正式名称',
      content: '字符串就是一串文字。你之前用 print("你好") 时，引号里的"你好"就是一个字符串。',
      detail: [
        '为什么叫"字符串"？因为它就是一个个"字符"像串珠子一样串在一起的。"火攻曹营" 是 1 个字符串，由 4 个字符组成。',
        '字符串用引号包起来。单引号 \'你好\' 和双引号 "你好" 效果一样，选哪个都行。',
      ],
    },
    {
      title: '三种常用操作',
      subtitle: '拼接、取字符、测长度',
      breakdown: [
        { code: '"火" + "攻"', label: '拼接——用 + 号把两段文字连在一起，得到 "火攻"。注意：文字和数字不能直接用 + 拼！"分数：" + 100 会报错。要先用 str(100) 把数字变成文字 "100"，再拼接。str 是 string（字符串）的缩写' },
        { code: 'message[0]', label: '取字符——用方括号 + 编号取出某个位置的字。编号从 0 开始！message[0] 是第 1 个字' },
        { code: 'len(message)', label: '测长度——数出字符串有几个字。"火攻曹营" 有 4 个字，len 返回 4' },
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── search ─────────── */
  'concept-search': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有搜索的笨办法',
      content: '想在军队里找阿斗？没有搜索，你得一个一个手动检查：',
      code: '# 笨办法：手动检查每个位置\narmy = ["曹兵", "曹兵", "阿斗", "曹兵"]\nif army[0] == "阿斗": print("在位置0")\nif army[1] == "阿斗": print("在位置1")\nif army[2] == "阿斗": print("在位置2")\nif army[3] == "阿斗": print("在位置3")\n# 100个人？写100行 if！',
      detail: [
        '搜索就是解决方案：用 for 循环自动遍历每个人，用 if 自动判断是不是目标。两三行搞定！',
      ],
    },
    {
      title: '搜索的套路',
      subtitle: 'for + if = 搜索',
      content: '搜索就是 for 循环 + if 条件的组合。看看 Python 怎么逐个检查：',
      code: '# 基础版：找到"阿斗"\narmy = ["曹兵", "曹兵", "阿斗", "曹兵"]\nfor person in army:\n    if person == "阿斗":\n        print("找到阿斗了！")',
      output: '找到阿斗了！',
      trace: {
        headers: ['轮次', 'person', 'person == "阿斗"?', '执行 print?'],
        rows: [
          ['第 1 轮', '"曹兵"', 'False ✗', '跳过'],
          ['第 2 轮', '"曹兵"', 'False ✗', '跳过'],
          ['第 3 轮', '"阿斗"', 'True ✓', '找到阿斗了！'],
          ['第 4 轮', '"曹兵"', 'False ✗', '跳过'],
        ],
      },
    },
    {
      title: '进阶：同时知道位置',
      subtitle: '用 enumerate() 获取编号',
      content: '如果你不仅想找到"阿斗"，还想知道他在第几个位置，就用 enumerate()：',
      breakdown: [
        { code: 'enumerate(army)', label: '给列表里的每个元素加上编号（从 0 开始）' },
        { code: 'for i, person in enumerate(army):', label: '每轮同时拿到两个值：编号 i 和内容 person' },
      ],
      detail: [
        'i 是位置编号（从 0 开始），person 是元素内容。这两个名字你都可以自己起。',
        '没有 enumerate 时，for person in army 只能拿到内容，不知道在第几个位置。',
      ],
    },
    {
      title: '看看完整代码',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── stack ─────────── */
  'concept-stack': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有栈的笨办法',
      content: '用普通列表也能"后进先出"，但你得自己记住"只从末尾操作"——一不小心就搞混了：',
      code: '# 笨办法：用列表但容易出错\nlayers = ["第一层", "第二层", "第三层"]\nlast = layers[2]  # 手动记住最后一个是 [2]\nlayers.pop(0)  # 手滑从开头取了！顺序全乱了',
      detail: [
        '栈就是"后进先出"的规则：只能从最上面放和取。就像叠盘子、叠积木——最后放上去的最先拿走，绝不能从中间抽。',
        '浏览器的"后退"按钮就是栈：访问 A→B→C，后退先回到 B，再回到 A。',
      ],
    },
    {
      title: '两个核心操作',
      subtitle: 'append = 压入，pop = 弹出',
      breakdown: [
        { code: 'stack.append(x)', label: '压入（push）——把 x 放到栈顶（最上面）' },
        { code: 'stack.pop()', label: '弹出（pop）——取出并删除栈顶的元素（最上面那个）' },
      ],
      detail: [
        'Python 里用普通列表就能当栈用！append() 加到末尾就是"放到最上面"，pop() 取出末尾就是"拿走最上面的"。',
        '重点：pop() 取的永远是最后加进去的那个（后进先出 LIFO = Last In, First Out）。',
      ],
      trace: {
        headers: ['操作', '栈的内容（→ 是栈顶）', '返回值'],
        rows: [
          ['append("第一层伏兵")', '["第一层伏兵"] →', '—'],
          ['append("第二层伏兵")', '["第一层伏兵", "第二层伏兵"] →', '—'],
          ['append("第三层伏兵")', '["第一层伏兵", "第二层伏兵", "第三层伏兵"] →', '—'],
          ['pop()', '["第一层伏兵", "第二层伏兵"]', '"第三层伏兵"'],
        ],
      },
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── queue ─────────── */
  'concept-queue': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有队列的笨办法',
      content: '想实现"先来先走"？用普通列表的 pop(0) 可以，但很慢：',
      code: '# 笨办法：用列表的 pop(0)\nline = ["于禁", "庞德", "曹仁"]\nfirst = line.pop(0)  # 取出于禁\n# 问题：pop(0)后，庞德和曹仁都要往前挪一位\n# 队伍很长时，每次取人都要全员前移——太慢了！',
      detail: [
        '队列（deque）就是解决方案：popleft() 直接从队头取出，不需要其他人挪位——又快又正确！',
        '队列是"先进先出"（像排队买饭），和栈的"后进先出"正好相反。',
      ],
    },
    {
      title: '新知识：import',
      subtitle: '什么是 import？为什么需要它？',
      content: 'Python 有很多现成的工具，但不是所有工具都默认可用——有些需要你先"导入"才能用。',
      breakdown: [
        { code: 'from collections import deque', label: '从 collections（集合工具箱）里拿出 deque（双端队列）这个工具' },
        { code: 'from', label: '"从……里面"——指定哪个工具箱' },
        { code: 'import', label: '"拿出来"——把工具导入到你的代码中' },
      ],
      detail: [
        '就像打仗前要从军械库里领取武器——import 就是"领取"的动作。不 import 就不能用。',
        'print()、len() 这些是"自带武器"，不需要 import。deque 是"高级武器"，需要先 import。',
      ],
    },
    {
      title: '队列的两个核心操作',
      subtitle: 'append = 加入队尾，popleft = 从队头取出',
      breakdown: [
        { code: 'queue.append(x)', label: '从队尾加入——新来的人排在最后面' },
        { code: 'queue.popleft()', label: '从队头取出——最先排队的人最先走。注意是 popleft（pop + left = 从左边取出）' },
      ],
      trace: {
        headers: ['操作', '队列内容（← 队头 | 队尾 →）', '取出的人'],
        rows: [
          ['初始', '于禁 ← 庞德 ← 曹仁', '—'],
          ['popleft()', '庞德 ← 曹仁', '于禁（第一个来的先走）'],
          ['popleft()', '曹仁', '庞德'],
          ['append("张辽")', '曹仁 ← 张辽', '—（新来的排队尾）'],
        ],
      },
      detail: [
        '和栈的 pop() 对比：栈的 pop() 取最后一个（后进先出），队列的 popleft() 取第一个（先进先出）。',
        '为什么不用普通列表的 pop(0)？因为列表 pop(0) 取走第一个后，后面的人都要往前挪一位（慢）。deque 的 popleft() 直接从队头取出，不用挪（快）。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── dict ─────────── */
  'concept-dict': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '没有字典的笨办法',
      content: '想按名字查找计策？没有字典，你得写一堆 if/elif：',
      code: '# 笨办法：用 if/elif 逐个判断\nname = "第一计"\nif name == "第一计":\n    print("联吴抗曹")\nelif name == "第二计":\n    print("火烧赤壁")\nelif name == "第三计":\n    print("草船借箭")\n# 100 条计策？写 100 个 elif！',
      detail: [
        '计策越多，if/elif 越长。而且查找速度也慢——Python 要从第一个 if 开始，一个一个比对。',
        '字典就是解决方案：用"名字"直接找到内容，一步到位，不需要一个个比对！',
      ],
    },
    {
      title: '逐词拆解',
      subtitle: '字典的每个部分是什么？',
      breakdown: [
        { code: '{ }', label: '花括号——创建字典的"容器"符号（列表用 [ ]，字典用 { }）' },
        { code: '"第一计": "联吴抗曹"', label: '一对"键: 值"——冒号左边是键（名字），右边是值（内容）' },
        { code: 'plans["第一计"]', label: '用键来取值——方括号里放键的名字，就能取出对应的值' },
      ],
      detail: [
        '键必须是唯一的（不能有两个"第一计"），但值可以重复。',
        '添加新内容直接赋值：plans["第三计"] = "草船借箭" 就加了一条新记录。如果键已经存在，会覆盖旧值。',
        'len(plans) 返回字典里有几对"键-值"。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── encapsulation ─────────── */
  'concept-encapsulation': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '什么是 class（类）？',
      content: '之前学的变量、列表、字典都是 Python 自带的"盒子"。但如果你想造一种自己的盒子呢？class 就是"设计图纸"——描述你的盒子长什么样、能做什么。',
      detail: [
        'class = 设计图纸，对象 = 按图纸造出的成品。一张图纸可以造出很多个成品（对象）。',
        '比如 class City 是"城市的设计图"，City("西城") 和 City("洛阳") 是两座不同的城，但都是按照同一张图纸造的。',
      ],
    },
    {
      title: '逐词拆解：设计图纸',
      subtitle: 'class 里面的关键词（先只看结构）',
      breakdown: [
        { code: 'class City:', label: '画一张叫 City 的设计图。class 是关键字，City 是你起的名字' },
        { code: 'def __init__(self, name):', label: '"出厂设置"——每次按图纸造新城时，自动运行这段代码来设定属性' },
        { code: 'self', label: '"我自己"——指向正在被创造的这个对象。每个方法的第一个参数都是 self' },
        { code: 'self.name = name', label: '"我的名字 = 传进来的名字"。self.name 是属性（对象身上的标签）' },
        { code: 'def show(self):', label: '方法——对象能做的事。就像城的"功能"之一' },
      ],
    },
    {
      title: 'City("西城") 执行过程',
      subtitle: '按图纸造城时，Python 做了什么？',
      content: '当你写 xicheng = City("西城") 时，Python 会按顺序做这些事：',
      trace: {
        headers: ['步骤', '发生了什么', '结果'],
        rows: [
          ['1', 'Python 看到 City("西城")', '准备按 City 图纸造一个新对象'],
          ['2', '自动调用 __init__(self, "西城")', 'self 指向新对象，name = "西城"'],
          ['3', 'self._soldiers = 0', '新城的士兵数设为 0（外面看不到）'],
          ['4', 'self.name = "西城"', '新城的名字设为"西城"'],
          ['5', '把新对象存进 xicheng', '现在 xicheng 就是这座城了'],
          ['6', 'xicheng.show()', '调用方法，输出"西城：城门大开"'],
        ],
      },
      detail: [
        '封装的核心：外面只需要 City("西城") 和 .show()，不需要知道里面有 _soldiers。就像空城计——外面只看到城门大开，里面有什么不知道。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],

  /* ─────────── custom data structures ─────────── */
  'concept-custom-ds': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '为什么要"自定义数据结构"？',
      content: '之前学了列表、字典、栈、队列……但有时一个工具不够用。你可以用 class 把它们组合起来，造出全新的工具！',
      detail: [
        '就像诸葛亮发明木牛流马——不是凭空创造，而是把已有的木头、齿轮、绳索组合成新东西。',
        '这个 Supply（补给车）就是用 class + 字典 组合出来的：用字典存数据，用方法来添加和展示。',
      ],
    },
    {
      title: '拆解 Supply 类',
      subtitle: '看看每个方法在做什么',
      breakdown: [
        { code: 'self.items = {}', label: '内部用字典来存数据——键是物品名，值是数量' },
        { code: 'def add(self, name, qty):', label: '添加方法——把"物品名: 数量"设置进字典。注意：如果已经有这个物品，会覆盖旧数量' },
        { code: 'def show(self):', label: '展示方法——遍历字典，打印每样物品' },
        { code: 'for k, v in self.items.items():', label: '.items() 取出字典每一对"键, 值"。这里 k 代表物品名，v 代表数量。k/v 是 key/value 的缩写，你也可以叫 item_name, amount' },
      ],
    },
    {
      title: '每一步发生了什么？',
      subtitle: '看看 items 字典的变化过程',
      content: '每次调用 add()，字典 items 里就会多一条记录：',
      trace: {
        headers: ['操作', 'self.items 的内容', '说明'],
        rows: [
          ['Supply()', '{}', '空字典，什么都没有'],
          ['add("粮草", 100)', '{"粮草": 100}', '加了 1 样物品'],
          ['add("箭矢", 500)', '{"粮草": 100, "箭矢": 500}', '加了第 2 样'],
          ['show()', '遍历打印每一对', '粮草: 100 → 箭矢: 500'],
        ],
      },
      detail: [
        '自定义数据结构的强大之处：你可以随意增加新方法，让它具备更多能力。比如加一个 total() 方法来计算总数量。',
      ],
    },
    {
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
    },
  ],
};
