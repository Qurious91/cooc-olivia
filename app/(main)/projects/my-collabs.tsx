"use client";

import { Briefcase, CalendarClock, Check, ChevronDown, MapPin, MessageCircle, MoreVertical, Pencil, PlayCircle, Sparkles, Trash2, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Modal from "../../modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { createChat, createCoocChat } from "../../data/chats";
import { type Collab, type CollabKind, collabHostLabel } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type CollabStatus = "recruiting" | "in_progress" | "done" | "cancelled";

type CollabRow = Collab & { location?: string; status: CollabStatus };

const STATUS_LABEL: Record<CollabStatus, string> = {
  recruiting: "모집중",
  in_progress: "진행중",
  done: "완료",
  cancelled: "취소됨",
};

type AppStatus = "pending" | "accepted";

type Application = {
  id: string;
  collab_id: string;
  applicant_id: string;
  status: AppStatus;
  message: string | null;
  affiliation: string;
  job_title: string;
  region: string;
  created_at: string;
};

const applicantLabel = (a: Application) => a.affiliation?.trim() || "익명 요청자";

export default function MyCollabs({ initialOpenId }: { initialOpenId?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<CollabRow[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(
    initialOpenId ? new Set([initialOpenId]) : new Set(),
  );
  const [applications, setApplications] = useState<Application[]>([]);
  const [pendingDelegate, setPendingDelegate] = useState<{
    collab: Collab;
    applicants: Application[];
  } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [proceedTarget, setProceedTarget] = useState<CollabRow | null>(null);
  const [revokeTarget, setRevokeTarget] = useState<Application | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onDown = (e: MouseEvent) => {
      if (menuContainerRef.current?.contains(e.target as Node)) return;
      setMenuOpen(null);
    };
    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [menuOpen]);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("collabs")
        .select("id, kind, author, title, description, period_start, period_end, period_start_time, period_end_time, location, status, created_at, collab_kinds(label), profiles!collabs_author_id_fkey(name, affiliation)")
        .eq("author_id", user.id)
        .order("created_at", { ascending: false });
      if (error) {
        console.error(
          "[my-collabs] select failed",
          error.message,
          error.details,
          error.hint,
          error.code,
        );
        return;
      }
      if (!data) return;
      const db: CollabRow[] = data.map((r: any) => ({
        id: r.id,
        kind: (r.collab_kinds?.label ?? "") as CollabKind,
        title: r.title,
        desc: r.description,
        partner: "",
        period: periodFromColumns({
          period_start: r.period_start,
          period_end: r.period_end,
          period_start_time: r.period_start_time,
          period_end_time: r.period_end_time,
        }),
        location: r.location ?? "",
        createdAt: Date.parse(r.created_at),
        author: r.author,
        authorName: r.profiles?.name ?? "",
        authorAffiliation: r.profiles?.affiliation ?? "",
        status: (r.status ?? "recruiting") as CollabStatus,
      }));
      setItems(db.filter((d) => d.status === "recruiting"));

      const myIds = db.map((d) => d.id);
      if (myIds.length === 0) return;
      const { data: apps, error: appsErr } = await supabase
        .from("collab_applications")
        .select("id, collab_id, applicant_id, status, message, created_at, profiles!collab_applications_applicant_id_fkey(affiliation, job_title, region)")
        .in("collab_id", myIds)
        .in("status", ["pending", "accepted"])
        .order("created_at", { ascending: false });
      if (appsErr) {
        console.error(
          "[my-collabs] applications select failed",
          appsErr.message,
          appsErr.details,
          appsErr.hint,
          appsErr.code,
        );
        return;
      }
      if (!apps) return;
      setApplications(
        apps.map((r: any) => ({
          id: r.id,
          collab_id: r.collab_id,
          applicant_id: r.applicant_id,
          status: (r.status ?? "pending") as AppStatus,
          message: r.message,
          created_at: r.created_at,
          affiliation: r.profiles?.affiliation ?? "",
          job_title: r.profiles?.job_title ?? "",
          region: r.profiles?.region ?? "",
        })),
      );
    })();
  }, []);

  useEffect(() => {
    if (!initialOpenId) return;
    setExpanded((prev) => {
      if (prev.has(initialOpenId)) return prev;
      const next = new Set(prev);
      next.add(initialOpenId);
      return next;
    });
    requestAnimationFrame(() => {
      document
        .getElementById(`collab-${initialOpenId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [initialOpenId]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const onDelete = (id: string) => {
    setRemoveTarget(id);
  };

  const confirmDelete = async () => {
    const id = removeTarget;
    if (!id) return;
    setRemoveTarget(null);
    const supabase = createClient();
    await supabase.from("collabs").delete().eq("id", id);
    setItems((prev) => prev.filter((c) => c.id !== id));
    setExpanded((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const declineApplication = async (appId: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== appId));
    const supabase = createClient();
    const { error } = await supabase
      .from("collab_applications")
      .update({ status: "declined" })
      .eq("id", appId);
    if (error) {
      console.error(
        "[my-collabs] decline failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
    }
  };

  const acceptApplication = async (app: Application) => {
    setApplications((prev) =>
      prev.map((a) => (a.id === app.id ? { ...a, status: "accepted" } : a)),
    );
    const supabase = createClient();
    const { error } = await supabase
      .from("collab_applications")
      .update({ status: "accepted" })
      .eq("id", app.id);
    if (error) {
      console.error(
        "[my-collabs] accept failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      setApplications((prev) =>
        prev.map((a) => (a.id === app.id ? { ...a, status: "pending" } : a)),
      );
    }
  };

  const confirmRevoke = async () => {
    const app = revokeTarget;
    if (!app) return;
    setRevokeTarget(null);
    const prev = applications;
    setApplications((list) => list.filter((a) => a.id !== app.id));
    const supabase = createClient();
    const { error } = await supabase
      .from("collab_applications")
      .update({ status: "declined" })
      .eq("id", app.id);
    if (error) {
      console.error(
        "[my-collabs] revoke failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      setApplications(prev);
    }
  };

  const openChat = (app: Application, collab: Collab) => {
    const room = createChat({
      withName: applicantLabel(app),
      withRole: app.job_title ?? "",
      sourceTitle: collab.title,
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  const confirmProceed = async () => {
    const c = proceedTarget;
    if (!c) return;
    setProceedTarget(null);
    const supabase = createClient();
    const { error: declineErr } = await supabase
      .from("collab_applications")
      .update({ status: "declined" })
      .eq("collab_id", c.id)
      .eq("status", "pending");
    if (declineErr) {
      console.error(
        "[my-collabs] proceed decline failed",
        declineErr.message,
        declineErr.details,
        declineErr.hint,
        declineErr.code,
      );
    }
    const { error } = await supabase
      .from("collabs")
      .update({ status: "in_progress" })
      .eq("id", c.id);
    if (error) {
      console.error(
        "[my-collabs] proceed failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      return;
    }
    setItems((prev) => prev.filter((i) => i.id !== c.id));
    setApplications((prev) => prev.filter((a) => a.collab_id !== c.id));
  };

  const delegateToCooc = (c: Collab, pending: Application[]) => {
    const room = createCoocChat({
      collab: {
        title: c.title,
        kind: c.kind,
        desc: c.desc,
        partner: c.partner,
        period: c.period,
      },
      applicantNames: pending.map((a) => applicantLabel(a)),
    });
    router.push(`/chat?id=${encodeURIComponent(room.id)}`);
  };

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
        <p className="text-xs text-text-5">
          아직 올린 제안이 없어요. 우측 하단의 “새 제안 올리기”로 시작해보세요.
        </p>
      </div>
    );
  }

  return (
    <div>
      <ul className="space-y-3">
        {items.map((c) => {
          const open = expanded.has(c.id);
          const applicants = applications.filter((a) => a.collab_id === c.id);
          const pendingApplicants = applicants.filter((a) => a.status === "pending");
          const host = collabHostLabel(c);
          return (
            <li
              key={c.id}
              id={`collab-${c.id}`}
              onClick={(e) => {
                if ((e.target as HTMLElement).closest("button, a, input, [role='button']")) return;
                toggle(c.id);
              }}
              className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-4 cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="text-xs text-text-5 flex items-center gap-1.5">
                    <span className="truncate">{host}</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]">
                      {c.kind}
                    </span>
                  </div>
                  <div className="mt-2 text-lg font-semibold text-text-1 truncate">
                    {c.title}
                  </div>
                  {(() => {
                    const periodLabel = formatPeriod(c.period);
                    const loc = c.location?.trim() ?? "";
                    if (!periodLabel && !loc) return null;
                    return (
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-6">
                        {periodLabel && (
                          <span className="inline-flex items-center gap-1 min-w-0">
                            <CalendarClock size={11} className="shrink-0" />
                            <span className="truncate">{periodLabel}</span>
                          </span>
                        )}
                        {loc && (
                          <span className="inline-flex items-center gap-1 min-w-0">
                            <MapPin size={11} className="shrink-0" />
                            <span className="truncate">{loc}</span>
                          </span>
                        )}
                      </div>
                    );
                  })()}
                </div>
                <div className="shrink-0 flex items-start gap-1.5">
                  <div className="flex flex-col items-end gap-1">
                    {c.status !== "recruiting" && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 text-text-4 border border-black/10 dark:border-white/15">
                        {STATUS_LABEL[c.status]}
                      </span>
                    )}
                    {pendingApplicants.length > 0 && (
                      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/30 dark:border-[#999f54]/40">
                        <UserPlus size={11} />
                        {pendingApplicants.length}
                      </span>
                    )}
                  </div>
                  <div
                    ref={menuOpen === c.id ? menuContainerRef : undefined}
                    className="relative"
                  >
                    <button
                      type="button"
                      aria-label="더보기"
                      aria-expanded={menuOpen === c.id}
                      onClick={() =>
                        setMenuOpen((prev) => (prev === c.id ? null : c.id))
                      }
                      className="p-1 -m-1 rounded-full text-text-6 hover:bg-black/5 dark:hover:bg-white/10"
                    >
                      <MoreVertical size={16} />
                    </button>
                    {menuOpen === c.id && (
                      <div className="absolute right-0 top-full mt-1 w-28 rounded-lg border border-border bg-surface shadow-lg z-10 overflow-hidden">
                        <Link
                          href={`/collab?id=${c.id}`}
                          onClick={() => setMenuOpen(null)}
                          className="flex items-center gap-2 px-3 py-2 text-xs text-text-2 hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                        >
                          <Pencil size={12} className="text-text-5" />
                          수정
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            setMenuOpen(null);
                            onDelete(c.id);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-500/5 border-t border-black/5 dark:border-white/5"
                        >
                          <Trash2 size={12} />
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-2 flex justify-end">
                <button
                  onClick={() => toggle(c.id)}
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
                  {c.desc ? (
                    <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                      {c.desc}
                    </p>
                  ) : (
                    <p className="text-xs text-text-6">아직 설명이 비어 있어요.</p>
                  )}

                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <UserPlus size={12} className="text-[#4a4d22] dark:text-[#d4d8a8]" />
                        <h4 className="text-xs font-semibold text-text-1">
                          참여 요청 {applicants.length}
                        </h4>
                      </div>
                      {pendingApplicants.length > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelegate({ collab: c, applicants: pendingApplicants })
                          }
                          className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full bg-[#999f54]/10 dark:bg-[#999f54]/20 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/30 dark:border-[#999f54]/40 font-semibold hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
                        >
                          <Sparkles size={11} />
                          COOC에게 맡기기
                        </button>
                      )}
                    </div>
                    {applicants.length === 0 ? (
                      <p className="text-[11px] text-text-6">아직 참여 요청이 없어요.</p>
                    ) : (
                      <ul className="space-y-2">
                        {applicants.map((a) => (
                          <li
                            key={a.id}
                            className={`rounded-lg p-2.5 border ${
                              a.status === "accepted"
                                ? "bg-emerald-500/5 border-emerald-500/25"
                                : "bg-[#999f54]/8 border-[#999f54]/20"
                            }`}
                          >
                            <div className="flex items-start gap-2">
                              <span
                                className={`w-8 h-8 shrink-0 rounded-full text-[#F2F0DC] inline-flex items-center justify-center ${
                                  a.status === "accepted" ? "bg-emerald-600" : "bg-[#999f54]"
                                }`}
                              >
                                <User size={16} strokeWidth={1.75} />
                              </span>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5">
                                  <div className="text-xs font-semibold text-text-1 truncate">
                                    {applicantLabel(a)}
                                  </div>
                                  {a.status === "accepted" && (
                                    <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                                      <Check size={10} />
                                      수락됨
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5 flex items-baseline gap-1 text-[11px] text-text-5">
                                  <Briefcase size={11} className="text-[#999f54] shrink-0 self-center" />
                                  <span className="truncate">
                                    {[a.job_title, a.region].filter(Boolean).join(" · ") || "포지션 미기재"}
                                  </span>
                                </div>
                                {a.message && (
                                  <p className="mt-1.5 text-[11px] text-text-4">{a.message}</p>
                                )}
                              </div>
                            </div>
                            <div className="mt-2 flex gap-2 items-center justify-end flex-wrap">
                              {a.status === "pending" && (
                                <button
                                  onClick={() => declineApplication(a.id)}
                                  className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-full border border-transparent underline text-text-6 hover:text-text-4 font-semibold"
                                >
                                  다음 기회에
                                </button>
                              )}
                              {a.status === "accepted" && (
                                <button
                                  onClick={() => setRevokeTarget(a)}
                                  className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-full border border-transparent underline text-text-6 hover:text-red-600 font-semibold"
                                >
                                  수락 취소
                                </button>
                              )}
                              <button
                                onClick={() => openChat(a, c)}
                                className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-[#999f54]/40 text-[#4a4d22] dark:text-[#d4d8a8] hover:bg-[#999f54]/10 font-semibold"
                              >
                                <MessageCircle size={12} />
                                {a.status === "accepted" ? "채팅 열기" : "대화 시작하기"}
                              </button>
                              {a.status === "pending" && (
                                <button
                                  onClick={() => acceptApplication(a)}
                                  className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-transparent bg-[#999f54] text-[#F2F0DC] hover:opacity-90 font-semibold"
                                >
                                  <Check size={12} />
                                  수락
                                </button>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {c.status === "recruiting" && (
                    <button
                      type="button"
                      onClick={() => setProceedTarget(c)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
                    >
                      <PlayCircle size={14} />
                      이대로 진행하기
                    </button>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

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
        open={!!pendingDelegate}
        onClose={() => setPendingDelegate(null)}
        title="COOC에게 맡기기"
        size="sm"
      >
        {pendingDelegate && (
          <div className="flex flex-col gap-5">
            <div className="text-sm text-text-3 leading-relaxed space-y-2">
              <p>
                <span className="font-semibold text-text-1">{pendingDelegate.collab.title}</span>
                에 들어온 참여 요청 {pendingDelegate.applicants.length}건을 COOC 에이전시에
                위임합니다.
              </p>
              <p className="text-xs text-text-5">
                이후 매칭·조율은 COOC 채팅으로 이어져요.
              </p>
            </div>
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
                  const p = pendingDelegate;
                  setPendingDelegate(null);
                  delegateToCooc(p.collab, p.applicants);
                }}
                className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
              >
                맡기기
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!proceedTarget}
        onClose={() => setProceedTarget(null)}
        title="이대로 진행하기"
        size="sm"
      >
        {proceedTarget && (() => {
          const forThis = applications.filter((a) => a.collab_id === proceedTarget.id);
          const pendingForThis = forThis.filter((a) => a.status === "pending").length;
          const acceptedForThis = forThis.filter((a) => a.status === "accepted").length;
          return (
            <div className="flex flex-col gap-5">
              <div className="text-sm text-text-3 leading-relaxed space-y-2">
                <p>
                  <span className="font-semibold text-text-1">{proceedTarget.title}</span>
                  을(를) 진행중으로 전환합니다.
                </p>
                <p className="text-xs text-text-5">
                  {acceptedForThis > 0 && `수락한 ${acceptedForThis}명과 함께 진행해요. `}
                  새로운 참여 요청은 더 이상 받지 않아요
                  {pendingForThis > 0 &&
                    `. 응답 대기 중인 ${pendingForThis}건은 자동으로 거절 처리됩니다`}
                  .
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setProceedTarget(null)}
                  className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={confirmProceed}
                  className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
                >
                  진행 시작
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={!!revokeTarget}
        onClose={() => setRevokeTarget(null)}
        title="수락 취소"
        size="sm"
      >
        {revokeTarget && (
          <div className="flex flex-col gap-5">
            <div className="text-sm text-text-3 leading-relaxed space-y-2">
              <p>
                <span className="font-semibold text-text-1">
                  {applicantLabel(revokeTarget)}
                </span>
                의 수락을 취소할까요?
              </p>
              <p className="text-xs text-text-5">상대방에게 알림이 갑니다.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRevokeTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmRevoke}
                className="flex-[2] py-2.5 rounded-lg bg-red-500 text-white text-sm font-semibold hover:bg-red-600"
              >
                확인
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
