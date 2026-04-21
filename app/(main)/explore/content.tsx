"use client";

import { ArrowLeft, CalendarClock, Check, ChevronDown, Heart, MapPin, Pencil, Sparkles, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import FabNewCollab from "../fab-new-collab";
import Modal from "../../modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { createCoocApplyChat } from "../../data/chats";
import { HOME_CATEGORIES } from "../../data/categories";
import { type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

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
  mine?: boolean;
  desc?: string;
  detail?: string;
  period?: string;
};

export default function ExploreContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initial = searchParams.get("kind");
  const [kind, setKind] = useState<CollabKind>(isKind(initial) ? initial : KINDS[0]);
  const [dbRows, setDbRows] = useState<
    Array<{
      id: string;
      kind: string;
      mine: boolean;
      host: string;
      title: string;
      description: string;
      period: string | null;
      location: string | null;
      createdAt: string;
    }>
  >([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [pendingDelegate, setPendingDelegate] = useState<ViewItem | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const [likesRes, appsRes] = await Promise.all([
        supabase.from("collab_likes").select("collab_id").eq("user_id", user.id),
        supabase
          .from("collab_applications")
          .select("collab_id, status")
          .eq("applicant_id", user.id)
          .in("status", ["pending", "accepted"]),
      ]);
      if (likesRes.data) setLiked(new Set(likesRes.data.map((r: any) => r.collab_id as string)));
      if (appsRes.error) {
        console.error(
          "[explore] applications select failed",
          appsRes.error.message,
          appsRes.error.details,
          appsRes.error.hint,
          appsRes.error.code,
        );
      } else if (appsRes.data) {
        setApplied(new Set(appsRes.data.map((r: any) => r.collab_id as string)));
      }
    })();
  }, []);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("collabs")
        .select("id, author_id, author, title, description, period_start, period_end, period_start_time, period_end_time, location, created_at, collab_kinds(label), profiles!collabs_author_id_fkey(name, affiliation)")
        .order("created_at", { ascending: false });
      if (error) {
        console.error(
          "[explore] collabs select failed",
          error.message,
          error.details,
          error.hint,
          error.code,
        );
        return;
      }
      if (!data) return;
      setDbRows(
        data.map((r: any) => {
          const isMine = user ? r.author_id === user.id : false;
          const name = r.profiles?.name?.trim() ?? "";
          const aff = r.profiles?.affiliation?.trim() ?? "";
          const host =
            r.author === "소속"
              ? aff || name || "익명"
              : r.author === "둘 다"
              ? [aff, name].filter(Boolean).join(" · ") || "익명"
              : name || "익명";
          const period = periodFromColumns({
            period_start: r.period_start,
            period_end: r.period_end,
            period_start_time: r.period_start_time,
            period_end_time: r.period_end_time,
          });
          return {
            id: r.id,
            kind: r.collab_kinds?.label ?? "",
            mine: isMine,
            host,
            title: r.title,
            description: r.description,
            period: period || null,
            location: r.location ?? null,
            createdAt: r.created_at,
          };
        }),
      );
    })();
  }, []);

  const toggleLike = async (id: string) => {
    const willLike = !liked.has(id);
    setLiked((prev) => {
      const next = new Set(prev);
      if (willLike) next.add(id);
      else next.delete(id);
      return next;
    });
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLiked((prev) => {
        const next = new Set(prev);
        if (willLike) next.delete(id);
        else next.add(id);
        return next;
      });
      return;
    }
    if (willLike) {
      await supabase
        .from("collab_likes")
        .insert({ user_id: user.id, collab_id: id });
    } else {
      await supabase
        .from("collab_likes")
        .delete()
        .eq("user_id", user.id)
        .eq("collab_id", id);
    }
  };

  const onDelete = (id: string) => {
    setRemoveTarget(id);
  };

  const confirmDelete = async () => {
    const id = removeTarget;
    if (!id) return;
    setRemoveTarget(null);
    const supabase = createClient();
    await supabase.from("collabs").delete().eq("id", id);
    setDbRows((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
        willApply ? "[explore] apply failed" : "[explore] withdraw failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      rollback();
    }
  };

  const delegateApply = (it: ViewItem) => {
    const room = createCoocApplyChat({
      listing: {
        title: it.title,
        host: it.host,
        kind,
        detail: it.detail,
      },
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  const items: ViewItem[] = useMemo(
    () =>
      dbRows
        .filter((r) => r.kind === kind)
        .map((r) => ({
          id: r.id,
          host: r.host,
          title: r.title,
          meta:
            formatPeriod(r.period) ||
            new Date(r.createdAt).toLocaleDateString("ko-KR"),
          location: r.location?.trim() || (r.mine ? "내 게시물" : ""),
          mine: r.mine,
          desc: r.description,
          detail: r.description,
          period: r.period ?? undefined,
        })),
    [kind, dbRows],
  );

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="sticky top-0 z-10 bg-surface border-b border-black/10 dark:border-white/10 flex items-center gap-1.5 px-3 py-1.5">
        <Link
          href="/home"
          aria-label="뒤로"
          className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
        >
          <ArrowLeft size={16} />
        </Link>
        <h1 className="text-[13px] font-semibold text-text-1">어떤 협업을 원하시나요?</h1>
      </header>

      <div className="sticky top-[36px] z-10 bg-surface border-b border-black/5 dark:border-white/5 px-3 py-2 overflow-x-auto">
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
                    : "bg-surface text-text-4 border-black/15 dark:border-white/15"
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
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button, a, input, [role='button']")) return;
                toggleExpand(it.id);
              }}
              className={`rounded-xl border bg-surface shadow-sm p-4 cursor-pointer ${
                it.mine ? "border-[#999f54]/60" : "border-black/10 dark:border-white/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-text-5 flex items-center gap-1.5">
                    <span className="truncate">{it.host}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]">
                      {kind}
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
                  onClick={() => toggleLike(it.id)}
                  aria-label={liked.has(it.id) ? "좋아요 취소" : "좋아요"}
                  aria-pressed={liked.has(it.id)}
                  className="shrink-0 p-1.5 -m-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
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
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-3"
                >
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
                          onClick={() => toggleApply(it.id)}
                          aria-pressed={applied.has(it.id)}
                          className={`inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full font-semibold ${
                            applied.has(it.id)
                              ? "bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/30 dark:border-[#999f54]/40"
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
                          className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-[#999f54]/10 dark:bg-[#999f54]/20 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/30 dark:border-[#999f54]/40 font-semibold hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
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
        open={removeTarget !== null}
        onClose={() => setRemoveTarget(null)}
        title="제안 삭제"
        size="sm"
      >
        <p className="text-sm text-text-2 leading-relaxed">
          이 제안과 관련된 내용이 모두 사라져요. 계속할까요?
        </p>
        <div className="mt-5 flex gap-2 justify-end">
          <button
            type="button"
            onClick={() => setRemoveTarget(null)}
            className="text-sm px-4 py-2 rounded-full border border-black/15 dark:border-white/15 text-text-1 hover:bg-black/5 dark:hover:bg-white/5"
          >
            취소
          </button>
          <button
            type="button"
            onClick={confirmDelete}
            className="text-sm px-4 py-2 rounded-full bg-red-500 text-white hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      </Modal>

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
              className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
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
