"use client";

import { ArrowLeft, Check, ChevronDown, Heart, Sparkles, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FabNewCollab from "../fab-new-collab";
import Modal from "../../modal";
import { createCoocApplyChat } from "../../data/chats";
import { HOME_CATEGORIES } from "../../data/categories";
import { COLLAB_FEED, type CollabListing } from "../../data/collab-feed";
import { type Collab, type CollabKind, deleteCollab, loadCollabs } from "../../data/collabs";

const KINDS = HOME_CATEGORIES.map((c) => c.label) as CollabKind[];

function isKind(v: string | null): v is CollabKind {
  return !!v && (KINDS as string[]).includes(v);
}

type ViewItem = {
  id: string;
  host: string;
  title: string;
  meta: string;
  location: string;
  status: CollabListing["status"] | "방금 등록";
  mine?: boolean;
  desc?: string;
  detail?: string;
  budget?: string;
  capacity?: string;
  contact?: string;
  partner?: string;
  period?: string;
};

export default function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("kind");
  const [kind, setKind] = useState<CollabKind>(isKind(initial) ? initial : KINDS[0]);
  const [mine, setMine] = useState<Collab[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [pendingDelegate, setPendingDelegate] = useState<ViewItem | null>(null);

  useEffect(() => {
    setMine(loadCollabs());
    try {
      const raw = window.localStorage.getItem("cooc.liked.v1");
      if (raw) setLiked(new Set(JSON.parse(raw) as string[]));
    } catch {}
    try {
      const raw = window.localStorage.getItem("cooc.applied.v1");
      if (raw) setApplied(new Set(JSON.parse(raw) as string[]));
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

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleApply = (id: string) => {
    setApplied((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        window.localStorage.setItem("cooc.applied.v1", JSON.stringify([...next]));
      } catch {}
      return next;
    });
  };

  const delegateApply = (it: ViewItem) => {
    const room = createCoocApplyChat({
      listing: {
        title: it.title,
        host: it.host,
        kind,
        detail: it.detail,
        budget: it.budget,
        capacity: it.capacity,
        contact: it.contact,
      },
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
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
        partner: c.partner,
        period: c.period,
      }));
    const feed: ViewItem[] = (COLLAB_FEED[kind] ?? []).map((f) => ({
      id: f.id,
      host: f.host,
      title: f.title,
      meta: f.meta,
      location: f.location,
      status: f.status,
      detail: f.detail,
      budget: f.budget,
      capacity: f.capacity,
      contact: f.contact,
    }));
    return [...own, ...feed];
  }, [kind, mine]);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-10 bg-white border-b border-black/10 flex items-center gap-1.5 px-3 py-1.5">
        <Link
          href="/home"
          aria-label="뒤로"
          className="p-1 rounded-full hover:bg-black/5"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-[13px] font-semibold text-text-1">어떤 협업을 원하시나요?</h1>
      </header>

      <div className="sticky top-[36px] z-10 bg-white border-b border-black/5 px-3 py-2 overflow-x-auto">
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
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-text-5 flex items-center gap-1.5">
                    <span className="truncate">{it.host}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[11px] text-[#4a4d22]">
                      {kind}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-text-1 truncate">
                    {it.title}
                  </div>
                </div>
                <button
                  onClick={() => toggleLike(it.id)}
                  aria-label={liked.has(it.id) ? "좋아요 취소" : "좋아요"}
                  aria-pressed={liked.has(it.id)}
                  className="shrink-0 p-1.5 -m-1 rounded-full hover:bg-black/5"
                >
                  <Heart
                    size={18}
                    className={
                      liked.has(it.id)
                        ? "fill-red-500 text-red-500"
                        : "text-text-6"
                    }
                  />
                </button>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => toggleExpand(it.id)}
                  aria-expanded={expanded.has(it.id)}
                  aria-label={expanded.has(it.id) ? "접기" : "자세히"}
                  className="inline-flex items-center gap-0.5 text-[11px] text-[#4a4d22]"
                >
                  자세히
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${expanded.has(it.id) ? "rotate-180" : ""}`}
                  />
                </button>
              </div>

              {expanded.has(it.id) && (
                <div className="mt-3 pt-3 border-t border-black/5 space-y-3">
                  {it.mine ? (
                    <>
                      {it.desc ? (
                        <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                          {it.desc}
                        </p>
                      ) : (
                        <p className="text-xs text-text-6">아직 설명이 비어 있어요.</p>
                      )}
                      <div className="flex justify-end">
                        <button
                          onClick={() => onDelete(it.id)}
                          className="inline-flex items-center gap-1 text-[11px] text-text-6 hover:text-red-600"
                        >
                          <Trash2 size={12} />
                          삭제
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      {it.detail && (
                        <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                          {it.detail}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => toggleApply(it.id)}
                          aria-pressed={applied.has(it.id)}
                          className={`inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full font-semibold ${
                            applied.has(it.id)
                              ? "bg-[#999f54]/15 text-[#4a4d22] border border-[#999f54]/30"
                              : "bg-[#999f54] text-[#F2F0DC]"
                          }`}
                        >
                          {applied.has(it.id) ? (
                            <>
                              <Check size={12} />
                              참여 요청됨
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} />
                              참여하기
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setPendingDelegate(it)}
                          className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-[#999f54]/10 text-[#4a4d22] border border-[#999f54]/30 font-semibold hover:bg-[#999f54]/15"
                        >
                          <Sparkles size={11} />
                          COOC에게 맡기기
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </main>
      <FabNewCollab />

      <Modal
        open={pendingDelegate !== null}
        onClose={() => setPendingDelegate(null)}
        title="COOC에게 맡기기"
        size="sm"
      >
        <div className="flex flex-col gap-5">
          <p className="text-sm text-text-3 leading-relaxed">
            COOC와의 채팅으로 바로 연결됩니다.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setPendingDelegate(null)}
              className="flex-1 py-2.5 rounded-lg border border-black/15 text-sm text-text-4"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => {
                if (pendingDelegate) delegateApply(pendingDelegate);
                setPendingDelegate(null);
              }}
              className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
            >
              확인
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
