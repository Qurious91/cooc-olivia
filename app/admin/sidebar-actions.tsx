"use client";

import { LogOut, Moon, Sun } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminSidebarActions({ collapsed = false }: { collapsed?: boolean }) {
  const router = useRouter();
  const supabase = createClient();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  const rowCls =
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm whitespace-nowrap text-text-4 hover:bg-black/5 dark:hover:bg-white/5 w-full text-left";
  const labelCls = `overflow-hidden transition-all duration-200 ${
    collapsed ? "max-w-0 opacity-0" : "max-w-[160px] opacity-100"
  }`;

  const themeLabel = dark ? "라이트 모드" : "다크 모드";

  return (
    <div className="p-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1">
      <button
        type="button"
        onClick={toggleTheme}
        title={collapsed ? themeLabel : undefined}
        className={rowCls}
      >
        {dark ? <Sun size={18} className="shrink-0" /> : <Moon size={18} className="shrink-0" />}
        <span className={labelCls}>{themeLabel}</span>
      </button>
      <button
        type="button"
        onClick={handleSignOut}
        title={collapsed ? "로그아웃" : undefined}
        className={rowCls}
      >
        <LogOut size={18} className="shrink-0" />
        <span className={labelCls}>로그아웃</span>
      </button>
    </div>
  );
}
