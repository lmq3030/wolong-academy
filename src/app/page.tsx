'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

/* ─── SVG Icon Components ────────────────────────────────────────────── */

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 38a4 4 0 0 1 4-4h28" />
      <path d="M10 4h28v40H10a4 4 0 0 1-4-4V8a4 4 0 0 1 4-4z" />
      <path d="M14 12h16" />
      <path d="M14 18h12" />
      <path d="M14 24h8" />
    </svg>
  );
}

function SwordsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 8l28 28" />
      <path d="M8 8l6 2-2 6" />
      <path d="M32 32l4 4" />
      <path d="M40 8L12 36" />
      <path d="M40 8l-6 2 2 6" />
      <path d="M16 32l-4 4" />
    </svg>
  );
}

function CardsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="8" width="24" height="32" rx="3" />
      <rect x="18" y="4" width="24" height="32" rx="3" />
      <path d="M14 20l4 4 6-8" />
    </svg>
  );
}

function ScrollIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 8c0-2.2 1.8-4 4-4h20c2.2 0 4 1.8 4 4v4H10V8z" />
      <path d="M10 12h28v28c0 2.2-1.8 4-4 4H14c-2.2 0-4-1.8-4-4V12z" />
      <path d="M16 20h16" />
      <path d="M16 26h12" />
      <path d="M16 32h8" />
    </svg>
  );
}

function CodeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16,14 8,24 16,34" />
      <polyline points="32,14 40,24 32,34" />
      <line x1="22" y1="10" x2="26" y2="38" />
    </svg>
  );
}

function FlameIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M24 4c0 8-12 16-12 28a12 12 0 0 0 24 0C36 20 24 12 24 4z" />
      <path d="M24 44c-3 0-6-2-6-6 0-6 6-10 6-14 0 4 6 8 6 14 0 4-3 6-6 6z" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <polyline points="12,5 19,12 12,19" />
    </svg>
  );
}

/* ─── Animation Variants ─────────────────────────────────────────────── */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.5, ease: 'easeOut' as const },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { delay: 0.4, duration: 0.5, type: 'spring' as const, stiffness: 200 },
  },
};

/* ─── Feature Card Data ──────────────────────────────────────────────── */

const features = [
  {
    title: '三国故事',
    description: '跟随刘备、关羽、张飞的脚步，在三国世界中冒险',
    Icon: BookIcon,
    color: 'text-shu-red',
    bg: 'bg-shu-red/10',
  },
  {
    title: '编程战斗',
    description: '用Python代码释放武将技，击败敌人！',
    Icon: SwordsIcon,
    color: 'text-wei-blue',
    bg: 'bg-wei-blue/10',
  },
  {
    title: '武将收集',
    description: '收集三国名将，打造你的最强阵容',
    Icon: CardsIcon,
    color: 'text-wu-green',
    bg: 'bg-wu-green/10',
  },
];

/* ─── Steps Data ─────────────────────────────────────────────────────── */

const steps = [
  {
    number: '一',
    title: '学习兵法',
    description: '阅读Python编程概念',
    Icon: ScrollIcon,
    color: 'text-shu-red',
    bg: 'bg-shu-red/10',
  },
  {
    number: '二',
    title: '编写代码',
    description: '写代码完成挑战关卡',
    Icon: CodeIcon,
    color: 'text-wei-blue',
    bg: 'bg-wei-blue/10',
  },
  {
    number: '三',
    title: '释放武将技',
    description: '看你的武将消灭敌人！',
    Icon: FlameIcon,
    color: 'text-gold',
    bg: 'bg-gold/10',
  },
];

/* ─── Main Landing Page ──────────────────────────────────────────────── */

export default function Home() {
  const ctaHref = '/map';

  return (
    <div className="flex min-h-screen flex-col bg-parchment">
      {/* Decorative top border */}
      <div className="h-1.5 bg-gradient-to-r from-shu-red via-gold to-shu-red" />

      {/* ── Hero Section ──────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center justify-center px-6 py-24 sm:py-32 text-center overflow-hidden">
        {/* Subtle background pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 flex flex-col items-center gap-6 max-w-3xl">
          {/* English subtitle badge */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0}
            className="flex items-center gap-2"
          >
            <span className="block w-8 h-0.5 bg-gold rounded-full" />
            <span className="text-gold text-xs tracking-[0.2em] font-semibold uppercase">
              Sleeping Dragon Academy
            </span>
            <span className="block w-8 h-0.5 bg-gold rounded-full" />
          </motion.div>

          {/* Main title */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={1}
            className="text-7xl sm:text-8xl lg:text-9xl font-black text-ink tracking-wider leading-none"
          >
            卧龙学堂
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={2}
            className="text-xl sm:text-2xl text-bamboo font-semibold"
          >
            用Python征服三国
          </motion.p>

          {/* Tagline */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={3}
            className="text-base sm:text-lg text-bamboo/80 max-w-md leading-relaxed"
          >
            成为诸葛亮的弟子，学习编程，称霸天下！
          </motion.p>

          {/* CTA Button */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <Link
              href={ctaHref}
              className="inline-flex items-center justify-center gap-2 min-w-[200px] h-14 rounded-xl bg-shu-red text-white text-lg font-bold tracking-wide shadow-lg shadow-shu-red/25 border-2 border-gold/60 transition-all hover:scale-105 hover:shadow-xl hover:shadow-shu-red/30 active:scale-95"
            >
              开始游戏
              <ArrowRightIcon className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Feature Cards Section ─────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-ink text-center mb-12"
          >
            三大玩法
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                className="flex flex-col items-center gap-4 bg-white rounded-2xl p-8 shadow-md border border-bamboo/10 text-center"
              >
                <div className={`w-16 h-16 rounded-xl ${f.bg} flex items-center justify-center`}>
                  <f.Icon className={`w-8 h-8 ${f.color}`} />
                </div>
                <h3 className="text-xl font-bold text-ink">{f.title}</h3>
                <p className="text-sm text-bamboo leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works Section ──────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20 bg-white/50">
        <div className="max-w-4xl mx-auto">
          <motion.h2
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={0}
            className="text-3xl sm:text-4xl font-bold text-ink text-center mb-14"
          >
            三步称霸天下
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden sm:block absolute top-12 left-[calc(16.67%+24px)] right-[calc(16.67%+24px)] h-0.5 bg-gradient-to-r from-shu-red via-wei-blue to-gold" />

            {steps.map((s, i) => (
              <motion.div
                key={s.title}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i + 1}
                className="flex flex-col items-center gap-3 text-center relative"
              >
                {/* Step circle */}
                <div className={`relative z-10 w-24 h-24 rounded-full ${s.bg} border-2 border-current ${s.color} flex flex-col items-center justify-center shadow-sm bg-parchment`}>
                  <span className="text-xs font-bold opacity-60">第{s.number}步</span>
                  <s.Icon className={`w-8 h-8 ${s.color}`} />
                </div>
                <h3 className="text-lg font-bold text-ink mt-2">{s.title}</h3>
                <p className="text-sm text-bamboo">{s.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Second CTA ────────────────────────────────────────────────── */}
      <section className="px-6 py-16 sm:py-20 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          custom={0}
          className="flex flex-col items-center gap-6"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-ink">
            准备好了吗，小军师？
          </h2>
          <Link
            href={ctaHref}
            className="inline-flex items-center justify-center gap-2 min-w-[200px] h-14 rounded-xl bg-shu-red text-white text-lg font-bold tracking-wide shadow-lg shadow-shu-red/25 border-2 border-gold/60 transition-all hover:scale-105 hover:shadow-xl hover:shadow-shu-red/30 active:scale-95"
          >
            开始冒险
            <ArrowRightIcon className="w-5 h-5" />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="px-6 py-8 text-center border-t border-bamboo/10">
        <p className="text-sm text-bamboo/70">
          卧龙学堂 &copy; 2026
        </p>
        <p className="text-xs text-bamboo/50 mt-1">
          专为8-9岁三国迷设计的Python学习游戏
        </p>
      </footer>

      {/* Decorative bottom border */}
      <div className="h-1.5 bg-gradient-to-r from-shu-red via-gold to-shu-red" />
    </div>
  );
}
