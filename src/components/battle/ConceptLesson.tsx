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
      subtitle: '为什么需要 print()?',
      content: '写代码时，电脑不会自动告诉你结果——你必须命令它"说出来"。print() 就是这个命令：把括号里的东西显示到屏幕上。',
      detail: [
        '想象你是军师，写了一封密信。如果不派人送出去，谁也看不到。print() 就是"送信人"——把你的消息送到屏幕上。',
        '没有 print()，代码会默默执行但你看不到任何结果。所以每当你想看到什么，就用 print() 把它"说出来"。',
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
      subtitle: '为什么需要变量？',
      content: '如果你要多次用到"赵云"这个名字，每次都打字太麻烦了。变量就是给一个值起个名字，以后用名字就能代替它。',
      detail: [
        '变量就像一个有标签的盒子：你把"赵云"放进一个叫 hero 的盒子里，以后说 hero，Python 就知道你指的是"赵云"。',
        '如果你改主意了，还可以换掉盒子里的内容：hero = "关羽"，现在 hero 变成了"关羽"。',
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
      subtitle: '为什么需要函数？',
      content: '如果同样的代码要写好几遍（比如让不同武将喊战号），太浪费了。函数就是"写一次，用多次"的办法。',
      detail: [
        '函数就像一本兵法手册：先写好步骤（"定义"），以后随时翻开来用（"调用"）。',
        '你可以传入不同的"原料"（参数），每次得到不同的结果。同一套兵法，换个将军就能用！',
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
      subtitle: '为什么需要 if/else？',
      content: '打仗不能只有一个方案——兵多就正面打，兵少就用计谋。程序也需要根据不同情况做不同的事，这就是 if/else。',
      detail: [
        'if/else 让程序学会"做判断"。就像军师看到敌情后，选择不同的策略。',
        '生活中到处都是 if/else：如果下雨，带伞；否则不带。如果考了100分，奖励；否则继续加油。',
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
      title: '看看代码怎么写',
      subtitle: '军师的示范',
      code: c.example,
      output: c.expectedOutput,
      detail: [
        'soldiers = 500，500 > 1000 不成立（False），所以跳过 if 下面的代码，执行 else 下面的 print。',
      ],
    },
  ],

  /* ─────────── lists ─────────── */
  'concept-lists': (c) => [
    {
      title: `兵书：${c.threeKingdomsName}`,
      subtitle: '为什么需要列表？',
      content: '一个变量只能装一个东西。但如果你有一整支军队的名单呢？列表就是一个能装很多东西的大盒子，按顺序排好。',
      detail: [
        '变量是一个盒子装一个东西：hero = "赵云"。列表是一排盒子连在一起：heroes = ["刘备", "关羽", "张飞"]。',
        '列表里的东西有顺序——第一个、第二个、第三个……你可以用编号找到任意一个。',
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
      subtitle: 'while 也是循环？和 for 有什么不同？',
      content: '上一章学了 for 循环——适合"我明确知道要重复几次"的场景。但有时候你不知道要重复几次，只知道"到了某个条件就停"。这就是 while 循环！',
      detail: [
        'for 循环像"点名"：按名单一个一个来，名单上有几个人就执行几次。',
        'while 循环像"守城"：一直守着，直到敌人撤退（条件不满足）才停下来。你不知道敌人什么时候撤，但你知道撤了就停。',
        '它们的共同点：都是让代码重复执行。区别在于"什么时候停"。',
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
      subtitle: '什么是 bug？为什么叫"虫子"？',
      content: '程序员写的代码有错误，就叫"bug"（虫子）。这个词来自早期电脑——一只真的虫子卡在电路里导致故障！找出并修复 bug 的过程叫"debug"（除虫）。',
      detail: [
        '就像华佗刮骨疗毒：先找到"毒"在哪里（bug 在哪行），再对症下药（修复代码）。',
        '每个程序员都会写出 bug，这很正常！重要的是学会"找"和"修"。',
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
      subtitle: '列表创建后还能改吗？',
      content: '当然能！列表不是写死的——你可以往里面添加、取出、甚至删除元素，就像点将册可以随时更新。',
      detail: [
        '之前学的 append() 是"添加"。这一章还会学 pop()（取出）和 len()（数数）。',
        '这三个操作是列表最常用的，几乎每个程序都会用到。',
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
      subtitle: '什么是"字符串"？',
      content: '字符串就是一串文字。你之前用 print("你好") 时，引号里的"你好"就是一个字符串。这一章学习对文字做更多操作。',
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
      subtitle: '什么是"搜索"？',
      content: '搜索就是在一堆数据中找到你要的那一个——就像赵云在百万军中寻找阿斗。最基本的方法是"逐个查找"。',
      detail: [
        '逐个查找的思路很简单：从列表第一个元素开始，一个一个看，看到目标就停下来。',
        '你已经学会了 for 循环和 if 条件，把它们组合起来就是搜索！',
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
      subtitle: '什么是"栈"？为什么需要它？',
      content: '想象你在叠盘子：最后放上去的盘子在最上面，所以最先被拿走。栈就是这样一种数据结构——"后进先出"。',
      detail: [
        '英文叫 Stack，像一摞叠起来的东西。你只能从最上面放东西（push）或拿东西（pop），不能从中间抽。',
        '生活中的栈：浏览器的"后退"按钮——你访问了 A→B→C，点后退先回到 B，再点回到 A。最后访问的最先回退。',
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
      subtitle: '什么是"队列"？和栈有什么不同？',
      content: '队列就像排队买饭：先来的先服务，后来的排在后面等。这叫"先进先出"——和栈正好相反！',
      detail: [
        '栈是"后进先出"（像叠盘子），队列是"先进先出"（像排队）。',
        '生活中的队列：排队买票、打印机任务队列（先发送的先打印）、消息排队发送。',
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
      subtitle: '为什么需要字典？',
      content: '列表用编号（0,1,2...）找东西。但如果你想用"名字"来找呢？比如你想说"第一计是什么"，而不是"编号0是什么"。字典就是为此而生。',
      detail: [
        '列表像点将册：第 0 个是关羽，第 1 个是张飞。你必须记住编号。',
        '字典像锦囊：每个锦囊有名字（"第一计"），打开就是内容（"联吴抗曹"）。用名字找比用编号直观多了！',
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
