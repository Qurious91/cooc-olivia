"use client";

import { Bell, Moon, Sun, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function HeaderActions() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  return (
    <div className="flex items-center gap-1 text-text-6">
      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button
        aria-label="Notifications"
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Bell size={20} />
      </button>
      <Link
        href="/profile"
        aria-label="Profile"
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <User size={20} />
      </Link>
    </div>
  );
}
