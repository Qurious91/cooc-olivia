"use client";

import { Check, ChevronDown, Heart, Sparkles, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Modal from "../../modal";
import { createCoocApplyChat } from "../../data/chats";
import { COLLAB_FEED, type CollabListing } from "../../data/collab-feed";
import { type Collab, type CollabKind, deleteCollab, loadCollabs } from "../../data/collabs";

type LikedItem = {
  id: string;
  kind: CollabKind;
  host: string;
  title: string;
  meta: string;
  location: string;
  status: CollabListing["status"] | "내 제안";
  mine?: boolean;
  detail?: string;
  budget?: string;
  capacity?: string;
  contact?: string;
  desc?: string;
  partner?: string;
  period?: string;
};

export default function LikedList() {
  const router = useRouter();
  const [liked, setLiked] = useState<string[]>([]);
  const [mine, setMine] = useState<Collab[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [pendingDelegate, setPendingDelegate] = useState<LikedItem | null>(null);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("cooc.liked.v1");
      setLiked(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {}
    try {
      const raw = window.localStorage.getItem("cooc.applied.v1");
      if (raw) setApplied(new Set(JSON.parse(raw) as string[]));
    } catch {}
    setMine(loadCollabs());
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const unlike = (id: string) => {
    setLiked((prev) => {
      const next = prev.filter((x) => x !== id);
      try {
        window.localStorage.setItem("cooc.liked.v1", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

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

  const delegateApply = (it: LikedItem) => {
    const room = createCoocApplyChat({
      listing: {
        title: it.title,
        host: it.host,
        kind: it.kind,
        detail: it.detail,
        budget: it.budget,
        capacity: it.capacity,
        contact: it.contact,
      },
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  const onDelete = (id: string) => {
    deleteCollab(id);
    setMine(loadCollabs());
    unlike(id);
  };

  const items: LikedItem[] = liked
    .map((id): LikedItem | null => {
      const own = mine.find((c) => c.id === id);
      if (own) {
        return {
          id,
          kind: own.kind,
          host: own.partner?.trim() || "내가 올림",
          title: own.title,
          meta: own.period?.trim() || new Date(own.createdAt).toLocaleDateString("ko-KR"),
          location: "내 게시물",
          status: "내 제안",
          mine: true,
          desc: own.desc,
          partner: own.partner,
          period: own.period,
        };
      }
      for (const [k, listings] of Object.entries(COLLAB_FEED) as [
        CollabKind,
        (typeof COLLAB_FEED)[CollabKind],
      ][]) {
        const hit = listings.find((l) => l.id === id);
        if (hit) {
          return {
            id,
            kind: k,
            host: hit.host,
            title: hit.title,
            meta: hit.meta,
            location: hit.location,
            status: hit.status,
            detail: hit.detail,
            budget: hit.budget,
            capacity: hit.capacity,
            contact: hit.contact,
          };
        }
      }
      return null;
    })
    .filter((x): x is LikedItem => x !== null);

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 bg-white shadow-sm p-6 text-center">
        <p className="text-xs text-text-5">
          아직 찜한 제안이 없어요.{" "}
          <Link className="text-[#4a4d22] underline" href="/explore">
            탐색하러 가기
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
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
                  {it.kind}
                </span>
              </div>
              <div className="mt-2 text-lg font-semibold text-text-1 truncate">
                {it.title}
              </div>
            </div>
            <button
              onClick={() => unlike(it.id)}
              aria-label="좋아요 취소"
              aria-pressed
              className="shrink-0 p-1.5 -m-1 rounded-full hover:bg-black/5"
            >
              <Heart size={18} className="fill-red-500 text-red-500" />
            </button>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              onClick={() => toggle(it.id)}
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
    </>
  );
}
