'use client';

export interface UserProfile {
  id: string;
  username: string;
  createdAt: string;
}

const USERS_KEY = 'wolong-users';
const CURRENT_KEY = 'wolong-current';

export function getUsers(): UserProfile[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

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
 * Login or register by username.
 * Calls server API to find/create player, then syncs progress to localStorage.
 * Returns the user profile.
 */
export async function loginUser(username: string): Promise<UserProfile> {
  const name = username.trim();

  // Call server — creates player if new, returns existing if found
  const res = await fetch('/api/player', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: name }),
  });

  if (!res.ok) {
    throw new Error('Login failed');
  }

  const { player } = await res.json();

  // Store user profile locally
  const users = getUsers();
  const existingIdx = users.findIndex((u) => u.username === name);
  const userProfile: UserProfile = {
    id: player.id,
    username: player.username,
    createdAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    users[existingIdx] = userProfile;
  } else {
    users.push(userProfile);
  }

  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_KEY, player.id);

  // Sync server progress to localStorage (server is source of truth)
  if (player.progressData) {
    localStorage.setItem(
      `wolong-progress-${player.id}`,
      JSON.stringify(player.progressData)
    );
  }

  return userProfile;
}

/**
 * Create user (legacy sync wrapper — calls loginUser).
 */
export function createUser(username: string): UserProfile {
  // Synchronous fallback: create locally, async sync happens in background
  const user: UserProfile = {
    id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    username: username.trim(),
    createdAt: new Date().toISOString(),
  };

  const users = getUsers();
  users.push(user);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.setItem(CURRENT_KEY, user.id);

  // Fire-and-forget server sync
  loginUser(username).catch(() => {});

  return user;
}

export function switchUser(userId: string): void {
  if (typeof window === 'undefined') return;
  const users = getUsers();
  const target = users.find((u) => u.id === userId);
  if (target) {
    localStorage.setItem(CURRENT_KEY, target.id);
  }
}

export function deleteUser(userId: string): void {
  if (typeof window === 'undefined') return;
  const users = getUsers().filter((u) => u.id !== userId);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  localStorage.removeItem(`wolong-progress-${userId}`);
  const currentId = localStorage.getItem(CURRENT_KEY);
  if (currentId === userId) {
    localStorage.removeItem(CURRENT_KEY);
  }
}
