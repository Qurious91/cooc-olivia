"use client";

import { Bell, LogOut, MoreVertical, Moon, Palette, Sun, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

type NotifEntry = {
  c: { id: string; title: string; kind: string };
  count: number;
};

export default function HeaderActions() {
  const router = useRouter();
  const supabase = createClient();
  const [dark, setDark] = useState(false);
  const [notifs, setNotifs] = useState<NotifEntry[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [notifOpen, setNotifOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifPos, setNotifPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const [menuPos, setMenuPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const notifBtnRef = useRef<HTMLButtonElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);
  const menuBtnRef = useRef<HTMLButtonElement>(null);
  const menuPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    const loadSeen = () => {
      try {
        const raw = window.localStorage.getItem("cooc.seen.v1");
        if (raw) setSeen(new Set(JSON.parse(raw) as string[]));
      } catch {}
    };
    loadSeen();

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("collab_applications")
        .select("collab_id, collabs!inner(id, title, author_id, collab_kinds(label))")
        .eq("status", "pending")
        .eq("collabs.author_id", user.id);
      if (error) {
        console.error(
          "[header-actions] notif select failed",
          error.message,
          error.details,
          error.hint,
          error.code,
        );
        return;
      }
      if (!data) return;
      const map = new Map<string, NotifEntry>();
      for (const row of data as any[]) {
        const c = row.collabs;
        if (!c) continue;
        const existing = map.get(c.id);
        if (existing) existing.count += 1;
        else map.set(c.id, { c: { id: c.id, title: c.title, kind: c.collab_kinds?.label ?? "" }, count: 1 });
      }
      setNotifs([...map.values()]);
    })();

    const onStorage = (e: StorageEvent) => {
      if (e.key === "cooc.seen.v1") loadSeen();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [supabase]);

  const markSeen = (ids: string[]) => {
    setSeen((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.add(id));
      try {
        window.localStorage.setItem("cooc.seen.v1", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    if (!notifOpen && !menuOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (notifOpen && (notifBtnRef.current?.contains(t) || notifPanelRef.current?.contains(t))) return;
      if (menuOpen && (menuBtnRef.current?.contains(t) || menuPanelRef.current?.contains(t))) return;
      setNotifOpen(false);
      setMenuOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [notifOpen, menuOpen]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggleNotif = () => {
    if (!notifOpen && notifBtnRef.current) {
      const rect = notifBtnRef.current.getBoundingClientRect();
      setNotifPos({ top: rect.bottom + 8, right: 16 });
    }
    setMenuOpen(false);
    setNotifOpen((v) => !v);
  };

  const toggleMenu = () => {
    if (!menuOpen && menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, right: 16 });
    }
    setNotifOpen(false);
    setMenuOpen((v) => !v);
  };

  const handleSignOut = async () => {
    setMenuOpen(false);
    await supabase.auth.signOut();
    router.push("/signin");
    router.refresh();
  };

  const entries = notifs.filter((e) => !seen.has(e.c.id));
  const pending = entries.reduce((s, e) => s + e.count, 0);

  const openCollab = (id: string) => {
    markSeen([id]);
    setNotifOpen(false);
    router.push(`/projects?tab=mine&open=${encodeURIComponent(id)}`);
  };

  const seeAll = () => {
    markSeen(entries.map((e) => e.c.id));
    setNotifOpen(false);
    router.push("/projects?tab=mine");
  };

  return (
    <div className="flex items-center gap-1 text-text-6">
      <button
        ref={notifBtnRef}
        onClick={toggleNotif}
        aria-label="Notifications"
        aria-expanded={notifOpen}
        className="relative p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Bell size={20} />
        {pending > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none inline-flex items-center justify-center">
            {pending > 99 ? "99+" : pending}
          </span>
        )}
      </button>
      <Link
        href="/profile"
        aria-label="Profile"
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <User size={20} />
      </Link>
      <button
        ref={menuBtnRef}
        onClick={toggleMenu}
        aria-label="More"
        aria-expanded={menuOpen}
        className="p-1.5 -mx-0.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <MoreVertical size={20} />
      </button>
      {mounted && notifOpen &&
        createPortal(
          <div
            ref={notifPanelRef}
            role="menu"
            style={{ top: notifPos.top, right: notifPos.right }}
            className="fixed w-72 rounded-xl border border-border bg-surface shadow-lg z-[60] overflow-hidden"
          >
            <div className="px-3 py-2 border-b border-black/5 text-[11px] text-text-5">
              참여 요청 {pending}건
            </div>
            {entries.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-text-6">
                아직 들어온 참여 요청이 없어요.
              </div>
            ) : (
              <ul className="max-h-80 overflow-y-auto">
                {entries.map(({ c, count }) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      onClick={() => openCollab(c.id)}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-black/[0.03]"
                    >
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] inline-flex items-center justify-center">
                        <UserPlus size={14} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-text-1 truncate">
                          {c.title}
                        </div>
                        <div className="text-[11px] text-text-5 truncate">
                          {c.kind}
                        </div>
                      </div>
                      <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] font-semibold">
                        {count}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              type="button"
              onClick={seeAll}
              className="w-full text-center text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] font-semibold py-2 border-t border-black/5 hover:bg-black/[0.03]"
            >
              전체 보기
            </button>
          </div>,
          document.body,
        )}
      {mounted && menuOpen &&
        createPortal(
          <div
            ref={menuPanelRef}
            role="menu"
            style={{ top: menuPos.top, right: menuPos.right }}
            className="fixed w-40 rounded-xl border border-border bg-surface shadow-lg z-[60] overflow-hidden"
          >
            <button
              type="button"
              onClick={toggleTheme}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-1 hover:bg-black/[0.03]"
            >
              {dark ? <Sun size={16} className="text-text-5" /> : <Moon size={16} className="text-text-5" />}
              {dark ? "라이트 모드" : "다크 모드"}
            </button>
            <Link
              href="/design"
              onClick={() => setMenuOpen(false)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-1 border-t border-black/5 hover:bg-black/[0.03]"
            >
              <Palette size={16} className="text-text-5" />
              디자인
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-text-1 border-t border-black/5 hover:bg-black/[0.03]"
            >
              <LogOut size={16} className="text-text-5" />
              로그아웃
            </button>
          </div>,
          document.body,
        )}
    </div>
  );
}
