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
      '要显示文字，需要用引号把文字包起来，比如 print("你好")。',
      '你也可以用 print() 显示数字，比如 print(123)，数字不需要加引号。',
    ],
    'concept-variables': [
      '变量就像一个有名字的盒子。你可以把任何东西放进去，之后用名字就能取出来。',
      '创建变量用等号 =，比如 name = "刘备"，就是把"刘备"放进叫 name 的盒子里。',
      '用 + 号可以把多段文字拼在一起，比如 name + "出击！" 就会变成 "刘备出击！"。',
    ],
    'concept-functions': [
      '函数就像一本兵法手册。你先写好步骤（定义函数），以后随时可以翻开来用（调用函数）。',
      '用 def 开头定义函数，括号里可以放参数（就像兵法里的变量）。',
      '定义好之后，用函数名加括号来调用它，比如 attack("关羽") 就会执行 attack 里的代码。',
    ],
    'concept-if-else': [
      'if/else 就像军师在做判断：如果敌人从东边来，就派关羽；否则派张飞。',
      'if 后面跟一个条件，条件成立就执行 if 下面的代码。',
      'else 是"否则"的意思——条件不成立时执行。elif 是"否则如果"，可以判断多种情况。',
      '注意：== 是比较（是不是相等），= 是赋值（装进盒子），别搞混了！',
    ],
    'concept-lists': [
      '列表就像一份名单（点将册），可以把很多东西按顺序排在一起。',
      '用方括号 [] 创建列表，里面的元素用逗号隔开，比如 ["关羽", "张飞", "赵云"]。',
      'append() 可以往列表末尾添加新元素，就像在名单后面加一个人。',
      'len() 可以数出列表里有多少个元素，就像数一数名单上有多少人。',
    ],
    'concept-for-loop': [
      'for 循环就像检阅军队——从第一个士兵开始，一个一个地走过去，每个都执行同样的操作。',
      'range(5) 会产生 0、1、2、3、4 这五个数字，所以 for i in range(5) 会循环 5 次。',
      '你也可以直接遍历一个列表：for name in ["关羽", "张飞"] 会依次取出每个名字。',
      '循环体（要重复执行的代码）需要缩进 4 个空格，这是 Python 的规则！',
    ],
  };

  return explanations[conceptId] || [
    '这是一个新的编程概念，军师会在接下来的战斗中教你如何使用。',
    '仔细看代码示例，试着理解每一行在做什么。',
  ];
}
