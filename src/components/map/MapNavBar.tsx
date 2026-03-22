'use client';

import Link from 'next/link';
import type { LocalProgress } from '@/lib/progress';
import { UserSwitchButton } from '@/components/user/UserSwitchButton';

interface MapNavBarProps {
  progress: LocalProgress;
  /** Called when the user switches profiles so the parent can reload progress */
  onUserSwitch?: () => void;
}

export function MapNavBar({ progress, onUserSwitch }: MapNavBarProps) {
  const xpInLevel = progress.xp % 300;
  const xpPercent = Math.min(100, (xpInLevel / 300) * 100);

  return (
    <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-bamboo/30 bg-parchment/95 px-4 py-3 backdrop-blur-sm sm:px-6">
      {/* Left: Title */}
      <Link href="/" className="flex items-center gap-2">
        <span className="text-xl font-bold text-shu-red sm:text-2xl">
          卧龙学堂
        </span>
      </Link>

      {/* Center: Level + XP bar */}
      <div className="flex items-center gap-3">
        <span className="whitespace-nowrap text-sm font-semibold text-ink">
          Lv.{progress.level}
        </span>
        <div className="h-3 w-24 overflow-hidden rounded-full bg-bamboo/20 sm:w-40">
          <div
            className="h-full rounded-full bg-gradient-to-r from-gold to-shu-red transition-all duration-500"
            style={{ width: `${xpPercent}%` }}
          />
        </div>
        <span className="text-xs text-bamboo">
          {xpInLevel}/300 XP
        </span>
      </div>

      {/* Right: Nav links + user switch */}
      <div className="flex items-center gap-1 sm:gap-3">
        <NavButton href="/generals" label="武将" icon={SwordsIcon} />
        <NavButton href="/study" label="兵书" icon={BookIcon} />
        <NavButton href="/profile" label="个人" icon={UserIcon} />
        <UserSwitchButton onSwitch={onUserSwitch} />
      </div>
    </nav>
  );
}

interface NavButtonProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

function NavButton({ href, label, icon: Icon }: NavButtonProps) {
  return (
    <Link
      href={href}
      className="flex flex-col items-center gap-0.5 rounded-lg px-2 py-1 text-bamboo transition-colors hover:bg-bamboo/10 hover:text-ink sm:px-3"
    >
      <Icon className="h-5 w-5" />
      <span className="text-[10px] font-medium leading-none sm:text-xs">{label}</span>
    </Link>
  );
}

/* Simple inline SVG icons — avoids adding an icon library dependency */

function SwordsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 17.5 3 6V3h3l11.5 11.5" />
      <path d="M13 19l6-6" />
      <path d="M16 16l4 4" />
      <path d="M19 21l2-2" />
      <path d="M9.5 6.5 21 18v3h-3L6.5 9.5" />
      <path d="M11 5l-6 6" />
      <path d="M8 8 4 4" />
      <path d="M5 3 3 5" />
    </svg>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="5" />
      <path d="M20 21a8 8 0 0 0-16 0" />
    </svg>
  );
}
