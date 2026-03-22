'use client';

import { useState, useEffect } from 'react';
import { getCurrentUser, type UserProfile } from '@/lib/user';
import { UserSelectDialog } from './UserSelectDialog';

function SwitchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 3l4 4-4 4" />
      <path d="M20 7H4" />
      <path d="M8 21l-4-4 4-4" />
      <path d="M4 17h16" />
    </svg>
  );
}

interface UserSwitchButtonProps {
  /** Callback fired after the user switches or creates a new profile */
  onSwitch?: () => void;
  className?: string;
}

export function UserSwitchButton({ onSwitch, className }: UserSwitchButtonProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  const handleUserSelected = () => {
    setDialogOpen(false);
    setUser(getCurrentUser());
    onSwitch?.();
  };

  return (
    <>
      <button
        onClick={() => setDialogOpen(true)}
        className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-bamboo transition-colors hover:bg-bamboo/10 hover:text-ink sm:px-3 ${className ?? ''}`}
        title="切换用户"
      >
        <SwitchIcon className="h-4 w-4" />
        <span className="text-xs font-semibold sm:text-sm">
          {user?.username ?? '选择用户'}
        </span>
      </button>

      <UserSelectDialog
        open={dialogOpen}
        onUserSelected={handleUserSelected}
      />
    </>
  );
}
