"use client";

import { ArrowLeft, CalendarClock, Check, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HOME_CATEGORIES } from "../../data/categories";
import { type CollabKind } from "../../data/collabs";
import { ONGOING_DUMMY } from "./data";

const KINDS = HOME_CATEGORIES.map((c) => c.label) as CollabKind[];

function isKind(v: string | null): v is CollabKind {
  return !!v && (KINDS as string[]).includes(v);
}

export default function OngoingContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("kind");
  const [kind, setKind] = useState<CollabKind | "전체">(
    isKind(initial) ? initial : "전체",
  );
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const items = useMemo(
    () =>
      kind === "전체"
        ? ONGOING_DUMMY
        : ONGOING_DUMMY.filter((d) => d.kind === kind),
    [kind],
  );

  const activeMeta = HOME_CATEGORIES.find((c) => c.label === kind);
  const ActiveIcon = activeMeta?.Icon;

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-20 bg-surface border-b border-black/10 dark:border-white/10 flex items-center gap-1.5 px-3 py-1.5">
        <Link
          href="/home"
          aria-label="뒤로"
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-[13px] font-semibold text-text-1">진행중인 협업</h1>

        <div ref={menuRef} className="ml-auto relative">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-black/15 dark:border-white/15 bg-surface text-text-3 text-[11px]"
          >
            {ActiveIcon ? <ActiveIcon size={12} /> : null}
            <span>{kind}</span>
            <ChevronDown
              size={12}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </button>
          {open && (
            <div className="absolute right-0 top-full mt-1 w-40 rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-lg overflow-hidden z-30">
              <button
                type="button"
                onClick={() => {
                  setKind("전체");
                  setOpen(false);
                }}
                className="w-full flex items-center justify-between px-3 py-2 text-xs text-text-2 hover:bg-black/5 dark:hover:bg-white/5"
              >
                <span>전체</span>
                {kind === "전체" && <Check size={12} className="text-[#999f54]" />}
              </button>
              <div className="h-px bg-black/5 dark:bg-white/5" />
              {HOME_CATEGORIES.map(({ Icon, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setKind(label as CollabKind);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs text-text-2 hover:bg-black/5 dark:hover:bg-white/5"
                >
                  <span className="inline-flex items-center gap-1.5">
                    <Icon size={12} />
                    {label}
                  </span>
                  {kind === label && <Check size={12} className="text-[#999f54]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 px-4 py-4 pb-24 max-w-xl w-full mx-auto">
        <p className="text-xs text-text-5 mb-3">
          {kind} 진행중 {items.length}건
        </p>
        {items.length === 0 ? (
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
            <p className="text-xs text-text-5">진행 중인 {kind} 협업이 없어요.</p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <li
                key={it.id}
                className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm overflow-hidden"
              >
                <Link href={`/ongoing/${it.id}`} className="block">
                  <div className="aspect-[4/3] bg-black/5 dark:bg-white/5 relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={it.image}
                      alt={it.title}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white backdrop-blur-sm">
                      {it.kind}
                    </span>
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-semibold text-text-1 line-clamp-2 leading-snug min-h-[2.5rem]">
                      {it.title}
                    </div>
                    <div className="mt-1 text-[11px] text-text-5 truncate">
                      {it.host}
                    </div>
                    <div className="mt-1.5 flex flex-col gap-0.5 text-[10px] text-text-6">
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <CalendarClock size={10} className="shrink-0" />
                        <span className="truncate">{it.period}</span>
                      </span>
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <MapPin size={10} className="shrink-0" />
                        <span className="truncate">{it.location}</span>
                      </span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
