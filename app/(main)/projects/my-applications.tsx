"use client";

import { CalendarClock, CheckCircle2, ChevronDown, Clock3, MapPin, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "../../modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type ApplicationStatus = "pending" | "accepted" | "declined" | "withdrawn";

type AppItem = {
  id: string;
  collabId: string;
  kind: CollabKind;
  host: string;
  title: string;
  meta: string;
  location: string;
  status: ApplicationStatus;
  message: string | null;
  sharedName: string | null;
  sharedAvatarUrl: string | null;
  sharedAffiliation: string | null;
  sharedJobTitle: string | null;
  sharedRegion: string | null;
  sharedKeywords: string[] | null;
  createdAt: string;
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "응답 대기",
  accepted: "수락됨",
  declined: "거절됨",
  withdrawn: "취소됨",
};

const STATUS_CLASS: Record<ApplicationStatus, string> = {
  pending:
    "bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border-[#999f54]/30 dark:border-[#999f54]/40",
  accepted:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  declined: "bg-red-500/10 text-red-600 dark:text-red-300 border-red-500/30",
  withdrawn: "bg-black/5 dark:bg-white/10 text-text-6 border-black/10 dark:border-white/10",
};

const STATUS_ICON: Record<ApplicationStatus, typeof Clock3> = {
  pending: Clock3,
  accepted: CheckCircle2,
  declined: XCircle,
  withdrawn: X,
};

export default function MyApplications() {
  const [items, setItems] = useState<AppItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<AppItem | null>(null);

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
      const { data, error } = await supabase
        .from("collab_applications")
        .select(
          "id, collab_id, message, status, created_at, applicant_name, applicant_avatar_url, applicant_affiliation, applicant_job_title, applicant_region, applicant_keywords, collabs(id, title, author, period_start, period_end, period_start_time, period_end_time, location, collab_kinds(label), profiles!collabs_author_id_fkey(name, affiliation))",
        )
        .eq("applicant_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(
          "[my-applications] select failed",
          error.message,
          error.details,
          error.hint,
          error.code,
        );
        setLoaded(true);
        return;
      }
      if (!data) {
        setLoaded(true);
        return;
      }
      const rows = data
        .map((r: any): AppItem | null => {
          const c = r.collabs;
          if (!c) return null;
          const name = c.profiles?.name?.trim() ?? "";
          const aff = c.profiles?.affiliation?.trim() ?? "";
          const host =
            c.author === "소속"
              ? aff || name || "익명"
              : c.author === "둘 다"
              ? [aff, name].filter(Boolean).join(" · ") || "익명"
              : name || "익명";
          const period = periodFromColumns({
            period_start: c.period_start,
            period_end: c.period_end,
            period_start_time: c.period_start_time,
            period_end_time: c.period_end_time,
          });
          return {
            id: r.id,
            collabId: c.id,
            kind: (c.collab_kinds?.label ?? "") as CollabKind,
            host,
            title: c.title,
            meta: formatPeriod(period) || new Date(r.created_at).toLocaleDateString("ko-KR"),
            location: c.location?.trim() ?? "",
            status: r.status as ApplicationStatus,
            message: r.message,
            sharedName: r.applicant_name ?? null,
            sharedAvatarUrl: r.applicant_avatar_url ?? null,
            sharedAffiliation: r.applicant_affiliation ?? null,
            sharedJobTitle: r.applicant_job_title ?? null,
            sharedRegion: r.applicant_region ?? null,
            sharedKeywords: r.applicant_keywords ?? null,
            createdAt: r.created_at,
          };
        })
        .filter((x): x is AppItem => x !== null);
      setItems(rows);
      setLoaded(true);
    })();
  }, []);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const withdraw = async (appId: string) => {
    const prev = items;
    setItems((list) =>
      list.map((i) => (i.id === appId ? { ...i, status: "withdrawn" } : i)),
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("collab_applications")
      .update({ status: "withdrawn" })
      .eq("id", appId);
    if (error) {
      console.error(
        "[my-applications] withdraw failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      setItems(prev);
    }
  };

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
        <p className="text-xs text-text-5">
          아직 보낸 참여 요청이 없어요.{" "}
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
      {items.map((it) => {
        const StatusIcon = STATUS_ICON[it.status];
        const open = expanded.has(it.id);
        return (
          <li
            key={it.id}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button, a, input, [role='button']")) return;
              toggle(it.id);
            }}
            className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-4 cursor-pointer"
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
                {(it.meta || it.location) && (
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-6">
                    {it.meta && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <CalendarClock size={11} className="shrink-0" />
                        <span className="truncate">{it.meta}</span>
                      </span>
                    )}
                    {it.location && (
                      <span className="inline-flex items-center gap-1 min-w-0">
                        <MapPin size={11} className="shrink-0" />
                        <span className="truncate">{it.location}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>
              <span
                className={`shrink-0 inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_CLASS[it.status]}`}
              >
                <StatusIcon size={11} />
                {STATUS_LABEL[it.status]}
              </span>
            </div>

            <div className="mt-2 flex justify-end">
              <button
                onClick={() => toggle(it.id)}
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

            {open && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="mt-3 pt-3 border-t border-black/5 dark:border-white/5 space-y-3"
              >
                {(it.sharedName ||
                  it.sharedAffiliation ||
                  it.sharedJobTitle ||
                  it.sharedRegion ||
                  (it.sharedKeywords && it.sharedKeywords.length > 0)) && (
                  <div className="rounded-lg bg-[#999f54]/5 border border-[#999f54]/20 p-2.5">
                    <div className="text-[10px] font-semibold text-text-5 tracking-wider mb-1.5">
                      게시자에게 공개한 정보
                    </div>
                    <div className="flex items-start gap-2">
                      {it.sharedAvatarUrl && (
                        <span className="w-7 h-7 shrink-0 rounded-full overflow-hidden bg-[#999f54] inline-flex items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={it.sharedAvatarUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </span>
                      )}
                      <div className="min-w-0 flex-1">
                        {it.sharedName && (
                          <div className="text-xs font-semibold text-text-1 truncate">
                            {it.sharedName}
                          </div>
                        )}
                        {(it.sharedAffiliation ||
                          it.sharedJobTitle ||
                          it.sharedRegion) && (
                          <div className="mt-0.5 text-[11px] text-text-5 truncate">
                            {[it.sharedAffiliation, it.sharedJobTitle, it.sharedRegion]
                              .filter(Boolean)
                              .join(" · ")}
                          </div>
                        )}
                        {it.sharedKeywords && it.sharedKeywords.length > 0 && (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {it.sharedKeywords.map((k) => (
                              <span
                                key={k}
                                className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-[#999f54]/10 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25"
                              >
                                #{k}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
                {it.message && (
                  <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                    {it.message}
                  </p>
                )}
                {(it.status === "pending" || it.status === "accepted") && (
                  <div className="flex justify-end items-center gap-3">
                    <button
                      onClick={() =>
                        it.status === "accepted" ? setCancelTarget(it) : withdraw(it.id)
                      }
                      className="inline-flex items-center gap-1 text-[11px] text-text-6 hover:text-red-600"
                    >
                      <X size={12} />
                      {it.status === "accepted" ? "참여 취소" : "신청 취소"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>

    <Modal
      open={!!cancelTarget}
      onClose={() => setCancelTarget(null)}
      title="참여 취소"
      size="sm"
    >
      {cancelTarget && (
        <div className="flex flex-col gap-5">
          <div className="text-sm text-text-3 leading-relaxed space-y-2">
            <p>
              <span className="font-semibold text-text-1">{cancelTarget.title}</span>
              {" "}참여를 취소할까요?
            </p>
            <p className="text-xs text-text-5">상대방에게 알림이 갑니다.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setCancelTarget(null)}
              className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => {
                const t = cancelTarget;
                setCancelTarget(null);
                if (t) withdraw(t.id);
              }}
              className="flex-[2] py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </Modal>
    </>
  );
}
