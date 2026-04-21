"use client";

import {
  Bell,
  Briefcase,
  LogOut,
  MessageCircle,
  Moon,
  Sun,
  User,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { createClient } from "@/lib/supabase/client";

const NAV_ITEMS = [
  { href: "/messages", label: "채팅", Icon: MessageCircle },
  { href: "/projects", label: "프로젝트", Icon: Briefcase },
] as const;

const ROW =
  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-text-4 hover:bg-black/5 dark:hover:bg-white/5 w-full text-left";

type NotifEntry = {
  c: { id: string; title: string; kind: string };
  count: number;
};

export default function SideNav() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [dark, setDark] = useState(false);
  const [notifs, setNotifs] = useState<NotifEntry[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [notifOpen, setNotifOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [notifPos, setNotifPos] = useState<{ top: number; left: number }>({
    top: 0,
    left: 0,
  });
  const bellBtnRef = useRef<HTMLButtonElement>(null);
  const notifPanelRef = useRef<HTMLDivElement>(null);

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
          "[side-nav] notif select failed",
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

  useEffect(() => {
    if (!notifOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        bellBtnRef.current?.contains(t) ||
        notifPanelRef.current?.contains(t)
      )
        return;
      setNotifOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [notifOpen]);

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

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggleNotif = () => {
    if (!notifOpen && bellBtnRef.current) {
      const rect = bellBtnRef.current.getBoundingClientRect();
      setNotifPos({ top: rect.top, left: rect.right + 8 });
    }
    setNotifOpen((v) => !v);
  };

  const handleSignOut = async () => {
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
    <>
      <aside className="hidden min-[1100px]:flex fixed left-0 top-0 bottom-0 w-56 border-r border-[#999f54]/30 bg-background flex-col z-30">
        <Link
          href="/home"
          className="px-5 py-4 text-2xl font-bold tracking-tight text-text-1 border-b border-[#999f54]/30"
        >
          COOC
        </Link>
        <nav className="flex-1 p-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ href, label, Icon }) => {
            const active = pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
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
        </nav>
        <div className="p-3 border-t border-black/5 dark:border-white/5 flex flex-col gap-1">
          <button
            ref={bellBtnRef}
            type="button"
            onClick={toggleNotif}
            aria-expanded={notifOpen}
            className={`${ROW} relative`}
          >
            <Bell size={18} />
            알림
            {pending > 0 && (
              <span className="ml-auto min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none inline-flex items-center justify-center">
                {pending > 99 ? "99+" : pending}
              </span>
            )}
          </button>
          <Link href="/profile" className={ROW}>
            <User size={18} />
            프로필
          </Link>
          <button type="button" onClick={toggleTheme} className={ROW}>
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? "라이트 모드" : "다크 모드"}
          </button>
          <button type="button" onClick={handleSignOut} className={ROW}>
            <LogOut size={18} />
            로그아웃
          </button>
        </div>
      </aside>
      {mounted && notifOpen &&
        createPortal(
          <div
            ref={notifPanelRef}
            role="menu"
            style={{ top: notifPos.top, left: notifPos.left }}
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
    </>
  );
}
