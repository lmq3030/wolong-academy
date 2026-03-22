'use client';

export interface UserProfile {
  id: string;
  username: string;
  createdAt: string;
}

const USERS_KEY = 'wolong-users';
const CURRENT_KEY = 'wolong-current';

/**
 * Get all registered user profiles from localStorage.
 */
export function getUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

/**
 * Get the currently active user, or null if none is selected.
 * Safe to call server-side (returns null).
 */
export function getCurrentUser(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const currentId = localStorage.getItem(CURRENT_KEY);
    if (!currentId) return null;
    const users = getUsers();
    return users.find((u) => u.id === currentId) ?? null;
  } catch {
    return null;
  }
}

/**
 * Create a new user profile and set it as the current user.
 */
export function createUser(username: string): UserProfile {
  const user: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username: username.trim(),
    createdAt: new Date().toISOString(),
  };

  const users = getUsers();
  users.push(user);

  if (typeof window !== 'undefined') {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    localStorage.setItem(CURRENT_KEY, user.id);
  }

  return user;
}

/**
 * Switch the active user to the given userId.
 */
export function switchUser(userId: string): void {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (target) {
    localStorage.setItem(CURRENT_KEY, target.id);
  }
}

/**
 * Delete a user profile and their progress data.
 * If the deleted user is the current user, clear the current selection.
 */
export function deleteUser(userId: string): void {
  if (typeof window === 'undefined') return;

  const users = getUsers().filter((u) => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));

  // Remove that user's progress data
  localStorage.removeItem(`wolong-progress-${userId}`);

  // If the deleted user was the current user, clear selection
  const currentId = localStorage.getItem(CURRENT_KEY);
  if (currentId === userId) {
    localStorage.removeItem(CURRENT_KEY);
  }
}
