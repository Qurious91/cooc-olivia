"use client";

import { Calendar, ChevronDown, Mail, MapPin, Users, Wallet } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { COLLAB_FEED } from "../data/collab-feed";
import { type Collab, type CollabKind, loadCollabs } from "../data/collabs";

type LikedItem = {
  id: string;
  kind: CollabKind;
  host: string;
  title: string;
  meta: string;
  location: string;
  detail: string;
  budget: string;
  capacity: string;
  contact: string;
  mine?: boolean;
};

export default function LikedList() {
  const [liked, setLiked] = useState<string[]>([]);
  const [mine, setMine] = useState<Collab[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem("cooc.liked.v1");
      setLiked(raw ? (JSON.parse(raw) as string[]) : []);
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
          detail: own.desc || "아직 상세 설명이 등록되지 않았어요.",
          budget: "협의",
          capacity: own.partner?.trim() ? `찾는 파트너 · ${own.partner.trim()}` : "협의",
          contact: "내 프로필에서 메시지로 연락",
          mine: true,
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
    <ul className="space-y-3">
      {items.map((it) => {
        const open = expanded.has(it.id);
        return (
          <li
            key={it.id}
            className="rounded-xl border border-black/10 bg-white shadow-sm p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] text-text-5 truncate">
                  {it.kind} · {it.host}
                  {it.mine && <span className="ml-1 text-[#4a4d22]">(내가 올림)</span>}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-text-1 truncate">
                  {it.title}
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(it.id)}
                aria-expanded={open}
                aria-label={open ? "접기" : "자세히 보기"}
                className="shrink-0 flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border border-black/15 text-text-4"
              >
                {open ? "접기" : "보기"}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {open && (
              <div className="mt-3 pt-3 border-t border-black/5 space-y-3">
                <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                  {it.detail}
                </p>
                <dl className="grid grid-cols-1 gap-1.5 text-[11px] text-text-5">
                  <DetailRow Icon={Calendar} label="일정" value={it.meta} />
                  <DetailRow Icon={MapPin} label="장소" value={it.location} />
                  <DetailRow Icon={Wallet} label="처우" value={it.budget} />
                  <DetailRow Icon={Users} label="모집" value={it.capacity} />
                  <DetailRow Icon={Mail} label="연락처" value={it.contact} />
                </dl>
                {!it.mine && (
                  <button
                    type="button"
                    onClick={() =>
                      alert(`참여 신청을 보냈습니다 (프로토타입)\n\n${it.title}`)
                    }
                    className="w-full py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-xs font-semibold"
                  >
                    참여하기
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function DetailRow({
  Icon,
  label,
  value,
}: {
  Icon: typeof Calendar;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <Icon size={12} className="mt-0.5 text-text-6 shrink-0" />
      <span className="w-10 shrink-0 text-text-6">{label}</span>
      <span className="text-text-4">{value}</span>
    </div>
  );
}
