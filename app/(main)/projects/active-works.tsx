"use client";

import { CalendarClock, CheckCircle2, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "../../modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type Role = "host" | "member";

type WorkItem = {
  id: string;
  kind: CollabKind;
  title: string;
  desc: string;
  role: Role;
  partner: string;
  period: string | null;
  location: string;
};

export default function ActiveWorks({ onCompleted }: { onCompleted?: () => void }) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<WorkItem | null>(null);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoaded(true);
        return;
      }

      const [hostRes, memberRes] = await Promise.all([
        supabase
          .from("collabs")
          .select(
            "id, kind, author, title, description, period_start, period_end, period_start_time, period_end_time, location, created_at, collab_kinds(label), profiles!collabs_author_id_fkey(name, affiliation)",
          )
          .eq("author_id", user.id)
          .eq("status", "in_progress")
          .order("updated_at", { ascending: false }),
        supabase
          .from("collab_applications")
          .select(
            "id, collabs!inner(id, author, title, description, period_start, period_end, period_start_time, period_end_time, location, status, updated_at, collab_kinds(label), profiles!collabs_author_id_fkey(name, affiliation))",
          )
          .eq("applicant_id", user.id)
          .eq("status", "accepted")
          .eq("collabs.status", "in_progress"),
      ]);

      if (hostRes.error) {
        console.error(
          "[active-works] host select failed",
          hostRes.error.message,
          hostRes.error.details,
          hostRes.error.hint,
          hostRes.error.code,
        );
      }
      if (memberRes.error) {
        console.error(
          "[active-works] member select failed",
          memberRes.error.message,
          memberRes.error.details,
          memberRes.error.hint,
          memberRes.error.code,
        );
      }

      const mapHost = (r: any): WorkItem => {
        const name = r.profiles?.name?.trim() ?? "";
        const aff = r.profiles?.affiliation?.trim() ?? "";
        const partner =
          r.author === "소속"
            ? aff || name || "익명"
            : r.author === "둘 다"
            ? [aff, name].filter(Boolean).join(" · ") || "익명"
            : name || "익명";
        return {
          id: r.id,
          kind: (r.collab_kinds?.label ?? "") as CollabKind,
          title: r.title,
          desc: r.description,
          role: "host",
          partner,
          period: periodFromColumns({
            period_start: r.period_start,
            period_end: r.period_end,
            period_start_time: r.period_start_time,
            period_end_time: r.period_end_time,
          }),
          location: r.location ?? "",
        };
      };

      const mapMember = (row: any): WorkItem | null => {
        const c = row.collabs;
        if (!c) return null;
        const name = c.profiles?.name?.trim() ?? "";
        const aff = c.profiles?.affiliation?.trim() ?? "";
        const partner =
          c.author === "소속"
            ? aff || name || "익명"
            : c.author === "둘 다"
            ? [aff, name].filter(Boolean).join(" · ") || "익명"
            : name || "익명";
        return {
          id: c.id,
          kind: (c.collab_kinds?.label ?? "") as CollabKind,
          title: c.title,
          desc: c.description,
          role: "member",
          partner,
          period: periodFromColumns({
            period_start: c.period_start,
            period_end: c.period_end,
            period_start_time: c.period_start_time,
            period_end_time: c.period_end_time,
          }),
          location: c.location ?? "",
        };
      };

      const hostItems = (hostRes.data ?? []).map(mapHost);
      const memberItems = (memberRes.data ?? [])
        .map(mapMember)
        .filter((x): x is WorkItem => x !== null);

      const seen = new Set<string>();
      const merged: WorkItem[] = [];
      for (const it of [...hostItems, ...memberItems]) {
        if (seen.has(it.id)) continue;
        seen.add(it.id);
        merged.push(it);
      }
      setItems(merged);
      setLoaded(true);
    })();
  }, []);

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const confirmComplete = async () => {
    const w = completeTarget;
    if (!w) return;
    setCompleteTarget(null);
    const supabase = createClient();
    const { error } = await supabase
      .from("collabs")
      .update({ status: "done" })
      .eq("id", w.id);
    if (error) {
      console.error(
        "[active-works] complete failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== w.id));
    onCompleted?.();
  };

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
        <p className="text-xs text-text-5">
          진행 중인 협업이 없어요.{" "}
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
        {items.map((w) => {
        const open = expanded.has(w.id);
        const periodLabel = formatPeriod(w.period);
        return (
          <li
            key={w.id}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button, a, input, [role='button']")) return;
              toggleExpand(w.id);
            }}
            className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-4 cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <div className="text-xs text-text-5 flex items-center gap-1.5">
                  <span className="truncate">
                    {w.role === "host" ? w.partner : `with ${w.partner}`}
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]">
                    {w.kind}
                  </span>
                </div>
                <div className="mt-2 text-lg font-semibold text-text-1 truncate">
                  {w.title}
                </div>
                {(periodLabel || w.location) && (
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-6">
                    {periodLabel && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <CalendarClock size={11} className="shrink-0" />
                        <span className="truncate">{periodLabel}</span>
                      </span>
                    )}
                    {w.location && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{w.location}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span
                className={`shrink-0 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                  w.role === "host"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border-[#999f54]/30 dark:border-[#999f54]/40"
                }`}
              >
                {w.role === "host" ? "주최" : "참여"}
              </span>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                onClick={() => toggleExpand(w.id)}
                aria-expanded={open}
                aria-label={open ? "접기" : "자세히"}
                className="inline-flex items-center gap-0.5 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]"
              >
                자세히
                <ChevronDown
                  size={12}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            {open && (w.desc || w.role === "host") && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-3"
              >
                {w.desc && (
                  <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                    {w.desc}
                  </p>
                )}
                {w.role === "host" && (
                  <button
                    type="button"
                    onClick={() => setCompleteTarget(w)}
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
                  >
                    <CheckCircle2 size={14} />
                    완료하기
                  </button>
                )}
              </div>
            )}
          </li>
        );
      })}
      </ul>

      <Modal
        open={!!completeTarget}
        onClose={() => setCompleteTarget(null)}
        title="완료하기"
        size="sm"
      >
        {completeTarget && (
          <div className="flex flex-col gap-5">
            <div className="text-sm text-text-3 leading-relaxed space-y-2">
              <p>
                <span className="font-semibold text-text-1">{completeTarget.title}</span>
                을(를) 완료 처리합니다.
              </p>
              <p className="text-xs text-text-5">
                완료한 협업 섹션으로 이동하며, 이후 상태는 되돌릴 수 없어요.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setCompleteTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmComplete}
                className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
              >
                완료 처리
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
