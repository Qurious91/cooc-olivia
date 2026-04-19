"use client";

import { Bell, Moon, Sun, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { applicantCount } from "./data/applicants";
import { type Collab, loadCollabs } from "./data/collabs";

export default function HeaderActions() {
  const router = useRouter();
  const [dark, setDark] = useState(false);
  const [collabs, setCollabs] = useState<Collab[]>([]);
  const [seen, setSeen] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pos, setPos] = useState<{ top: number; right: number }>({ top: 0, right: 0 });
  const btnRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("theme");
    const isDark = saved === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);

    const compute = () => setCollabs(loadCollabs());
    const loadSeen = () => {
      try {
        const raw = window.localStorage.getItem("cooc.seen.v1");
        if (raw) setSeen(new Set(JSON.parse(raw) as string[]));
      } catch {}
    };
    compute();
    loadSeen();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cooc.collabs.v1") compute();
      if (e.key === "cooc.seen.v1") loadSeen();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

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
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (btnRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [open]);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  };

  const toggleOpen = () => {
    if (!open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({
        top: rect.bottom + 8,
        right: Math.max(8, window.innerWidth - rect.right),
      });
    }
    setOpen((v) => !v);
  };

  const entries = collabs
    .map((c) => ({ c, count: applicantCount(c.id) }))
    .filter((e) => e.count > 0 && !seen.has(e.c.id));
  const pending = entries.reduce((s, e) => s + e.count, 0);

  const openCollab = (id: string) => {
    markSeen([id]);
    setOpen(false);
    router.push(`/projects?tab=mine&open=${encodeURIComponent(id)}`);
  };

  const seeAll = () => {
    markSeen(entries.map((e) => e.c.id));
    setOpen(false);
    router.push("/projects?tab=mine");
  };

  return (
    <div className="flex items-center gap-1 text-text-6">
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        {dark ? <Sun size={20} /> : <Moon size={20} />}
      </button>
      <button
        ref={btnRef}
        onClick={toggleOpen}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10"
      >
        <Bell size={20} />
        {pending > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold leading-none inline-flex items-center justify-center">
            {pending > 99 ? "99+" : pending}
          </span>
        )}
      </button>
      {mounted && open &&
        createPortal(
          <div
            ref={panelRef}
            role="menu"
            style={{ top: pos.top, right: pos.right }}
            className="fixed w-72 rounded-xl border border-black/10 bg-white shadow-lg z-[60] overflow-hidden"
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
                      <span className="shrink-0 w-8 h-8 rounded-full bg-[#999f54]/15 text-[#4a4d22] inline-flex items-center justify-center">
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
                      <span className="shrink-0 text-[11px] px-1.5 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22] font-semibold">
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
              className="w-full text-center text-[11px] text-[#4a4d22] font-semibold py-2 border-t border-black/5 hover:bg-black/[0.03]"
            >
              전체 보기
            </button>
          </div>,
          document.body,
        )}
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
