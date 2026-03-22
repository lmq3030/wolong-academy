'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  getUsers,
  createUser,
  switchUser,
  deleteUser,
  type UserProfile,
} from '@/lib/user';

/* ─── SVG Icons ──────────────────────────────────────────────────────── */

function UserPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="8" r="5" />
      <path d="M18 21a8 8 0 0 0-16 0" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="17" y1="11" x2="23" y2="11" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3,6 5,6 21,6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.27 5.82 21 7 14.14l-5-4.87 6.91-1.01z" />
    </svg>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

interface UserCardProps {
  user: UserProfile;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

function UserCard({ user, onSelect, onDelete }: UserCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Read that user's progress for the summary
  const [summary, setSummary] = useState({ level: 1, xp: 0, chapters: 0 });
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`wolong-progress-${user.id}`);
      if (raw) {
        const data = JSON.parse(raw);
        setSummary({
          level: data.level ?? 1,
          xp: data.xp ?? 0,
          chapters: Object.keys(data.completedChapters ?? {}).length,
        });
      }
    } catch {
      // ignore
    }
  }, [user.id]);

  const initial = user.username.charAt(0).toUpperCase();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative flex flex-col items-center gap-2 rounded-2xl border border-bamboo/15 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Avatar circle */}
      <div className="w-14 h-14 rounded-full bg-shu-red flex items-center justify-center shadow-md border-2 border-gold/50">
        <span className="text-xl font-black text-white">{initial}</span>
      </div>

      {/* Username */}
      <h3 className="text-lg font-bold text-ink">{user.username}</h3>

      {/* Stats row */}
      <div className="flex items-center gap-3 text-xs text-bamboo">
        <span className="flex items-center gap-0.5">
          <StarIcon className="w-3.5 h-3.5 text-gold" />
          Lv.{summary.level}
        </span>
        <span>{summary.chapters} 关</span>
      </div>

      {/* Select button */}
      <button
        onClick={() => onSelect(user.id)}
        className="mt-1 w-full rounded-xl bg-shu-red/90 py-2.5 text-sm font-bold text-white transition-colors hover:bg-shu-red active:scale-95"
      >
        选择
      </button>

      {/* Delete button */}
      {!confirmDelete ? (
        <button
          onClick={() => setConfirmDelete(true)}
          className="absolute top-2 right-2 rounded-full p-1.5 text-bamboo/40 hover:text-shu-red/70 hover:bg-shu-red/5 transition-colors"
          title="删除"
        >
          <TrashIcon className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-bamboo">确定删除？</span>
          <button
            onClick={() => {
              onDelete(user.id);
              setConfirmDelete(false);
            }}
            className="rounded-lg bg-shu-red/10 px-3 py-1 font-semibold text-shu-red hover:bg-shu-red/20 transition-colors"
          >
            删除
          </button>
          <button
            onClick={() => setConfirmDelete(false)}
            className="rounded-lg bg-bamboo/10 px-3 py-1 font-semibold text-bamboo hover:bg-bamboo/20 transition-colors"
          >
            取消
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ─── Main Dialog ────────────────────────────────────────────────────── */

interface UserSelectDialogProps {
  open: boolean;
  onUserSelected: () => void;
}

export function UserSelectDialog({ open, onUserSelected }: UserSelectDialogProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');

  const refreshUsers = useCallback(() => {
    setUsers(getUsers());
  }, []);

  useEffect(() => {
    if (open) {
      refreshUsers();
      setShowCreate(false);
      setNewName('');
      setError('');
    }
  }, [open, refreshUsers]);

  const handleSelect = (userId: string) => {
    switchUser(userId);
    onUserSelected();
  };

  const handleDelete = (userId: string) => {
    deleteUser(userId);
    refreshUsers();
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (trimmed.length === 0) {
      setError('请输入你的名字');
      return;
    }
    if (trimmed.length > 8) {
      setError('名字最多8个字');
      return;
    }
    // Check for duplicate names
    if (users.some((u) => u.username === trimmed)) {
      setError('这个名字已经被用了');
      return;
    }

    createUser(trimmed);
    onUserSelected();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="user-select-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full max-w-md rounded-3xl bg-parchment border border-bamboo/15 shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-shu-red via-shu-red/90 to-shu-red px-6 py-5 text-center">
            <h2 className="text-2xl font-black text-white tracking-wide">
              欢迎来到卧龙学堂！
            </h2>
            <p className="mt-1 text-sm text-white/80 font-medium">
              选择你的角色
            </p>
          </div>

          <div className="px-5 py-5">
            {/* Existing Users Grid */}
            {users.length > 0 && !showCreate && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {users.map((user) => (
                  <UserCard
                    key={user.id}
                    user={user}
                    onSelect={handleSelect}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            )}

            {/* Create New User Form */}
            {(showCreate || users.length === 0) ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4 py-2"
              >
                {users.length > 0 && (
                  <button
                    onClick={() => {
                      setShowCreate(false);
                      setError('');
                    }}
                    className="self-start text-sm text-bamboo hover:text-ink transition-colors font-medium"
                  >
                    &larr; 返回选择
                  </button>
                )}

                <div className="w-20 h-20 rounded-full bg-bamboo/10 border-2 border-dashed border-bamboo/30 flex items-center justify-center">
                  <UserPlusIcon className="w-10 h-10 text-bamboo/50" />
                </div>

                <p className="text-base font-semibold text-ink">
                  创建新角色
                </p>

                <div className="w-full max-w-xs">
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => {
                      setNewName(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreate();
                    }}
                    placeholder="输入你的名字"
                    maxLength={8}
                    autoFocus
                    className="w-full rounded-xl border-2 border-bamboo/20 bg-white px-4 py-3 text-center text-lg font-semibold text-ink placeholder:text-bamboo/30 focus:border-shu-red/50 focus:outline-none transition-colors"
                  />
                  {error && (
                    <p className="mt-1.5 text-center text-xs font-medium text-shu-red">
                      {error}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleCreate}
                  disabled={newName.trim().length === 0}
                  className="w-full max-w-xs rounded-xl bg-shu-red py-3 text-base font-bold text-white shadow-md shadow-shu-red/20 transition-all hover:scale-[1.02] hover:shadow-lg active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
                >
                  开始冒险！
                </button>
              </motion.div>
            ) : (
              /* "Create new" button when showing existing users */
              <button
                onClick={() => setShowCreate(true)}
                className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-bamboo/20 py-3 text-sm font-semibold text-bamboo hover:border-shu-red/30 hover:text-shu-red/70 transition-colors"
              >
                <UserPlusIcon className="w-5 h-5" />
                创建新角色
              </button>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
