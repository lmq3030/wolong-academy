"use client";

import { LoginButton } from "@/components/auth/LoginButton";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-parchment px-4">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-shu-red via-gold to-shu-red" />

      <div className="flex flex-col items-center gap-8 max-w-md w-full">
        {/* Title block */}
        <div className="flex flex-col items-center gap-3 text-center">
          {/* Decorative brush-stroke style divider */}
          <div className="flex items-center gap-2 mb-2">
            <span className="block w-8 h-0.5 bg-gold rounded-full" />
            <span className="text-gold text-xs tracking-widest font-semibold">
              SLEEPING DRAGON ACADEMY
            </span>
            <span className="block w-8 h-0.5 bg-gold rounded-full" />
          </div>

          <h1 className="text-5xl sm:text-6xl font-black text-ink tracking-wide leading-tight">
            卧龙学堂
          </h1>

          <p className="text-lg sm:text-xl text-bamboo font-medium mt-1 leading-relaxed">
            成为诸葛亮的弟子，用Python征服三国！
          </p>
        </div>

        {/* Decorative scroll-like card */}
        <div className="w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-gold/30 shadow-lg p-8 flex flex-col items-center gap-6">
          {/* Illustration placeholder — a stylized feather fan icon */}
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-parchment border-2 border-gold/40">
            <svg
              className="w-10 h-10 text-shu-red"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Simple scroll/book icon */}
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8" />
              <path d="M8 11h6" />
            </svg>
          </div>

          <LoginButton />

          <p className="text-xs text-bamboo/70 text-center">
            请在家长的帮助下登录
          </p>
        </div>

        {/* Footer with subtle branding */}
        <p className="text-xs text-bamboo/50 text-center mt-4">
          卧龙学堂 &mdash; 三国 Python 编程冒险
        </p>
      </div>

      {/* Decorative bottom border */}
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-shu-red via-gold to-shu-red" />
    </main>
  );
}
