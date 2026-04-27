"use client";

import { CalendarClock, Check, ChevronDown, Heart, MapPin, Pencil, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type LikedItem = {
  id: string;
  kind: CollabKind;
  host: string;
  title: string;
  meta: string;
  location: string;
  mine?: boolean;
  desc?: string;
  detail?: string;
  period?: string;
};

export default function LikedList() {
  const router = useRouter();
  const [items, setItems] = useState<LikedItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: appsData, error: appsErr } = await supabase
        .from("collab_applications")
        .select("collab_id, status")
        .eq("applicant_id", user.id)
        .in("status", ["pending", "accepted"]);
      if (appsErr) {
        console.error(
          "[liked-card] applications select failed",
          appsErr.message,
          appsErr.details,
          appsErr.hint,
          appsErr.code,
        );
      } else if (appsData) {
        setApplied(new Set(appsData.map((r: any) => r.collab_id as string)));
      }

      const { data, error } = await supabase
        .from("collab_likes")
        .select(
          "collab_id, created_at, collabs(id, author_id, author, title, description, period_start, period_end, period_start_time, period_end_time, location, created_at, collab_kinds(label), profiles!collabs_author_id_fkey(name, affiliation))",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(
          "[liked-card] select failed",
          error.message,
          error.details,
          error.hint,
          error.code,
        );
        return;
      }
      if (!data) return;
      const rows = data
        .map((r: any): LikedItem | null => {
          const c = r.collabs;
          if (!c) return null;
          const isMine = c.author_id === user.id;
          const name = c.profiles?.name?.trim() ?? "";
          const aff = c.profiles?.affiliation?.trim() ?? "";
          const host = isMine
            ? "내가 올림"
            : c.author === "소속"
            ? aff || name || "익명"
            : c.author === "둘 다"
            ? [aff, name].filter(Boolean).join(" · ") || "익명"
            : name || "익명";
          const periodStr = periodFromColumns({
            period_start: c.period_start,
            period_end: c.period_end,
            period_start_time: c.period_start_time,
            period_end_time: c.period_end_time,
          });
          return {
            id: c.id,
            kind: (c.collab_kinds?.label ?? "") as CollabKind,
            host,
            title: c.title,
            meta:
              formatPeriod(periodStr) ||
              new Date(c.created_at).toLocaleDateString("ko-KR"),
            location: c.location?.trim() || (isMine ? "내 게시물" : ""),
            mine: isMine,
            desc: c.description,
            detail: c.description,
            period: periodStr,
          };
        })
        .filter((x): x is LikedItem => x !== null);
      setItems(rows);
    })();
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const unlike = async (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("collab_likes")
      .delete()
      .eq("user_id", user.id)
      .eq("collab_id", id);
  };

  const toggleApply = async (id: string) => {
    const willApply = !applied.has(id);
    setApplied((prev) => {
      const next = new Set(prev);
      if (willApply) next.add(id);
      else next.delete(id);
      return next;
    });
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const rollback = () =>
      setApplied((prev) => {
        const next = new Set(prev);
        if (willApply) next.delete(id);
        else next.add(id);
        return next;
      });
    if (!user) {
      rollback();
      return;
    }
    const { error } = willApply
      ? await supabase
          .from("collab_applications")
          .upsert(
            { collab_id: id, applicant_id: user.id, status: "pending" },
            { onConflict: "collab_id,applicant_id" },
          )
      : await supabase
          .from("collab_applications")
          .update({ status: "withdrawn" })
          .eq("applicant_id", user.id)
          .eq("collab_id", id);
    if (error) {
      console.error(
        willApply ? "[liked-card] apply failed" : "[liked-card] withdraw failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      rollback();
    }
  };

  const onDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("collabs").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
        <p className="text-xs text-text-5">
          아직 찜한 제안이 없어요.{" "}
          <Link className="text-[#4a4d22] dark:text-[#d4d8a8] underline" href="/explore">
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
          className={`rounded-xl border bg-surface shadow-sm p-4 ${
            it.mine ? "border-[#999f54]/60" : "border-black/10 dark:border-white/10"
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-xs text-text-5 flex items-center gap-1.5">
                <span className="truncate">{it.host}</span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]">
                  {it.kind}
                </span>
              </div>
              <div className="mt-2 text-lg font-semibold text-text-1 truncate">
                {it.title}
              </div>
              {(it.meta || (it.location && it.location !== "내 게시물")) && (
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-6">
                  {it.meta && (
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <CalendarClock size={11} className="shrink-0" />
                      <span className="truncate">{it.meta}</span>
                    </span>
                  )}
                  {it.location && it.location !== "내 게시물" && (
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <MapPin size={11} className="shrink-0" />
                      <span className="truncate">{it.location}</span>
                    </span>
                  )}
                </div>
              )}
            </div>
            <button
              onClick={() => unlike(it.id)}
              aria-label="좋아요 취소"
              aria-pressed
              className="shrink-0 p-1.5 -m-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
            >
              <Heart size={18} className="fill-red-500 text-red-500" />
            </button>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              onClick={() => toggle(it.id)}
              aria-expanded={expanded.has(it.id)}
              aria-label={expanded.has(it.id) ? "접기" : "자세히"}
              className="inline-flex items-center gap-0.5 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]"
            >
              자세히
              <ChevronDown
                size={12}
                className={`transition-transform ${expanded.has(it.id) ? "rotate-180" : ""}`}
              />
            </button>
          </div>

          {expanded.has(it.id) && (
            <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-3">
              {it.mine ? (
                <>
                  {it.desc ? (
                    <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                      {it.desc}
                    </p>
                  ) : (
                    <p className="text-xs text-text-6">아직 설명이 비어 있어요.</p>
                  )}
                  <div className="flex justify-end items-center gap-3">
                    <Link
                      href={`/collab?id=${it.id}`}
                      className="inline-flex items-center gap-1 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8] hover:underline"
                    >
                      <Pencil size={12} />
                      수정
                    </Link>
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
                      onClick={() => {
                        if (!applied.has(it.id)) toggleApply(it.id);
                      }}
                      disabled={applied.has(it.id)}
                      aria-pressed={applied.has(it.id)}
                      className={`inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full font-semibold ${
                        applied.has(it.id)
                          ? "bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/30 dark:border-[#999f54]/40 cursor-default"
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
                  </div>
                </>
              )}
            </div>
          )}
        </li>
      ))}
      </ul>
    </>
  );
}
