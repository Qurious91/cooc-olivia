"use client";

import { LogOut, Menu, Moon, Sun, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { NAV_ITEMS } from "./nav-items";

const ROW =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-4 hover:bg-black/5 dark:hover:bg-white/5 w-full text-left";

export default function AdminMobileMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onDown(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSignOut = async () => {
    setOpen(false);
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  return (
    <div ref={wrapRef} className="relative min-[1100px]:hidden">
      <button
        type="button"
        aria-label="메뉴"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 rounded-md text-text-4 hover:bg-black/5 dark:hover:bg-white/5"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] w-48 rounded-xl bg-surface border border-black/10 dark:border-white/10 shadow-lg p-2 flex flex-col gap-1"
        >
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active =
              href === "/admin"
                ? pathname === "/admin"
                : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                role="menuitem"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm ${
                  active
                    ? "bg-[#999f54]/15 text-[#4a4d22] dark:text-[#d4d8a8] font-semibold"
                    : "text-text-4 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
          <div className="mt-1 pt-1 border-t border-black/5 dark:border-white/5 flex flex-col gap-1">
            <button type="button" onClick={toggleTheme} className={ROW} role="menuitem">
              {dark ? <Sun size={18} /> : <Moon size={18} />}
              {dark ? "라이트 모드" : "다크 모드"}
            </button>
            <button type="button" onClick={handleSignOut} className={ROW} role="menuitem">
              <LogOut size={18} />
              로그아웃
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
