"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export function UserAvatar() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!session?.user) return null;

  const { name, image } = session.user;
  const initials = name?.charAt(0)?.toUpperCase() ?? "?";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full focus:outline-none focus:ring-2 focus:ring-gold cursor-pointer"
        aria-label="User menu"
      >
        {image ? (
          <img
            src={image}
            alt={name ?? "User avatar"}
            className="w-10 h-10 rounded-full border-2 border-gold object-cover"
            referrerPolicy="no-referrer"
          />
        ) : (
          <span className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-gold bg-shu-red text-white font-bold text-lg">
            {initials}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-bamboo/30 py-1 z-50">
          <div className="px-4 py-2 border-b border-bamboo/20">
            <p className="text-sm font-semibold text-ink truncate">{name}</p>
          </div>
          <button
            onClick={() => signOut()}
            className="w-full text-left px-4 py-2 text-sm text-ink hover:bg-parchment transition-colors cursor-pointer"
          >
            退出登录
          </button>
        </div>
      )}
    </div>
  );
}
