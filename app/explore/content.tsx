"use client";

import { ArrowLeft, ChevronRight, Heart, MapPin, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { HOME_CATEGORIES } from "../data/categories";
import { COLLAB_FEED, type CollabListing } from "../data/collab-feed";
import { type Collab, type CollabKind, deleteCollab, loadCollabs } from "../data/collabs";

const KINDS = HOME_CATEGORIES.map((c) => c.label) as CollabKind[];

function isKind(v: string | null): v is CollabKind {
  return !!v && (KINDS as string[]).includes(v);
}

type ViewItem = Omit<CollabListing, "status" | "detail" | "budget" | "capacity" | "contact"> & {
  status: CollabListing["status"] | "방금 등록";
  mine?: boolean;
  desc?: string;
};

export default function ExploreContent() {
  const searchParams = useSearchParams();
  const initial = searchParams.get("kind");
  const [kind, setKind] = useState<CollabKind>(isKind(initial) ? initial : KINDS[0]);
  const [mine, setMine] = useState<Collab[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  useEffect(() => {
    setMine(loadCollabs());
    try {
      const raw = window.localStorage.getItem("cooc.liked.v1");
      if (raw) setLiked(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const toggleLike = (id: string) => {
    setLiked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem("cooc.liked.v1", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const onDelete = (id: string) => {
    deleteCollab(id);
    setMine(loadCollabs());
  };

  const items: ViewItem[] = useMemo(() => {
    const own: ViewItem[] = mine
      .filter((c) => c.kind === kind)
      .map((c) => ({
        id: c.id,
        host: c.partner?.trim() || "내가 올림",
        title: c.title,
        meta: c.period?.trim() || new Date(c.createdAt).toLocaleDateString("ko-KR"),
        location: "내 게시물",
        status: "방금 등록",
        mine: true,
        desc: c.desc,
      }));
    const feed = COLLAB_FEED[kind] ?? [];
    return [...own, ...feed];
  }, [kind, mine]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 flex items-center gap-2 px-3 py-3">
        <Link
          href="/home"
          aria-label="뒤로"
          className="p-1.5 rounded-full hover:bg-black/5"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-base font-semibold text-text-1">어떤 협업을 원하시나요?</h1>
        <Link
          href="/collab"
          aria-label="새 협업 올리기"
          className="ml-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#999f54] text-[#F2F0DC] text-xs"
        >
          <Plus size={14} />
          올리기
        </Link>
      </header>

      <div className="sticky top-[52px] z-10 bg-white border-b border-black/5 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1.5 w-max">
          {HOME_CATEGORIES.map(({ Icon, label }) => {
            const active = label === kind;
            return (
              <button
                key={label}
                onClick={() => setKind(label as CollabKind)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
                  active
                    ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                    : "bg-white text-text-4 border-black/15"
                }`}
              >
                <Icon size={14} />
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <main className="flex-1 px-4 py-4 pb-24 max-w-xl w-full mx-auto">
        <p className="text-xs text-text-5 mb-3">
          {kind} 제안 {items.length}건
        </p>
        <ul className="space-y-3">
          {items.map((it) => (
            <li
              key={it.id}
              className={`rounded-xl border bg-white shadow-sm p-4 ${
                it.mine ? "border-[#999f54]/60" : "border-black/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] text-text-5 flex items-center gap-1.5">
                    {it.host}
                    {it.mine && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#999f54] text-[#F2F0DC]">
                        내가 올림
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-text-1 truncate">
                    {it.title}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => toggleLike(it.id)}
                    aria-label={liked.has(it.id) ? "좋아요 취소" : "좋아요"}
                    aria-pressed={liked.has(it.id)}
                    className="p-1 -m-1 rounded-full"
                  >
                    <Heart
                      size={16}
                      className={
                        liked.has(it.id)
                          ? "fill-red-500 text-red-500"
                          : "text-text-6"
                      }
                    />
                  </button>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22]">
                    {it.status}
                  </span>
                </div>
              </div>

              {it.mine && it.desc && (
                <p className="mt-2 text-xs text-text-4 whitespace-pre-wrap">{it.desc}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-5">
                <span>{it.meta}</span>
                <span className="inline-flex items-center gap-0.5">
                  <MapPin size={11} />
                  {it.location}
                </span>
                {it.mine ? (
                  <button
                    onClick={() => onDelete(it.id)}
                    aria-label="삭제"
                    className="ml-auto inline-flex items-center gap-0.5 text-text-6 hover:text-red-600"
                  >
                    <Trash2 size={12} />
                    삭제
                  </button>
                ) : (
                  <button className="ml-auto inline-flex items-center gap-0.5 text-[#4a4d22]">
                    자세히
                    <ChevronRight size={12} />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
