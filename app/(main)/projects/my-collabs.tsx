"use client";

import { Check, MessageCircle, MoreVertical, Pencil, PlayCircle, Trash2, User, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Modal from "../../modal";
import CollabCard from "../../_components/collab-card";
import ProfileModal from "../../_components/profile-modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { findOrCreateChatRoom } from "../../data/chats";
import { type Collab, type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type CollabStatus = "recruiting" | "in_progress" | "done" | "cancelled";

type CollabRow = Collab & {
  location?: string;
  status: CollabStatus;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  photos: string[];
};

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
  applicant_name: string | null;
  applicant_avatar_url: string | null;
  applicant_affiliation: string | null;
  applicant_job_title: string | null;
  applicant_region: string | null;
  applicant_keywords: string[] | null;
  created_at: string;
};

const applicantLabel = (a: Application) =>
  a.applicant_name?.trim() ||
  a.applicant_affiliation?.trim() ||
  "익명 요청자";

export default function MyCollabs({ initialOpenId }: { initialOpenId?: string }) {
  const router = useRouter();
  const [items, setItems] = useState<CollabRow[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(
    initialOpenId ? new Set([initialOpenId]) : new Set(),
  );
  const [applications, setApplications] = useState<Application[]>([]);
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [proceedTarget, setProceedTarget] = useState<CollabRow | null>(null);
  const [declineTarget, setDeclineTarget] = useState<Application | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<Application | null>(null);
  const [chatTarget, setChatTarget] = useState<{ app: Application; collab: CollabRow } | null>(null);
  const [menuOpen, setMenuOpen] = useState<string | null>(null);
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);
  const [myCollabIds, setMyCollabIds] = useState<string[]>([]);
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
        .select("id, kind, author, title, description, period_start, period_end, period_start_time, period_end_time, location, status, created_at, collab_kinds(label), profiles!collabs_author_id_fkey(name, nickname, avatar_url, affiliation), collab_photos(image_url, position)")
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
      const db: CollabRow[] = data.map((r: any) => {
        const photoRows = (r.collab_photos ?? []) as Array<{
          image_url: string;
          position: number;
        }>;
        const photos = photoRows
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((p) => p.image_url);
        const nickname = r.profiles?.nickname?.trim() ?? "";
        const name = r.profiles?.name?.trim() ?? "";
        return {
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
          authorName: name,
          authorAffiliation: r.profiles?.affiliation ?? "",
          status: (r.status ?? "recruiting") as CollabStatus,
          authorId: user.id,
          authorNickname: nickname || name || "익명",
          authorAvatarUrl: r.profiles?.avatar_url ?? null,
          photos,
        };
      });
      setItems(db.filter((d) => d.status === "recruiting"));

      const myIds = db.map((d) => d.id);
      setMyCollabIds(myIds);
      if (myIds.length === 0) return;
      const { data: apps, error: appsErr } = await supabase
        .from("collab_applications")
        .select(
          "id, collab_id, applicant_id, status, message, created_at, profiles!collab_applications_applicant_id_fkey(name, nickname, avatar_url, affiliation, job_title, region, keywords)",
        )
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
        apps.map((r: any) => {
          const p = r.profiles ?? null;
          const nickname = p?.nickname?.trim() ?? "";
          const name = p?.name?.trim() ?? "";
          return {
            id: r.id,
            collab_id: r.collab_id,
            applicant_id: r.applicant_id,
            status: (r.status ?? "pending") as AppStatus,
            message: r.message,
            created_at: r.created_at,
            applicant_name: nickname || name || null,
            applicant_avatar_url: p?.avatar_url ?? null,
            applicant_affiliation: p?.affiliation ?? null,
            applicant_job_title: p?.job_title ?? null,
            applicant_region: p?.region ?? null,
            applicant_keywords: p?.keywords ?? null,
          };
        }),
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

  // 내 collab들에 들어오는 신청을 실시간으로 반영
  useEffect(() => {
    if (myCollabIds.length === 0) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`my-collab-applications:${myCollabIds.join("-")}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "collab_applications",
          filter: `collab_id=in.(${myCollabIds.join(",")})`,
        },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            const newRow = payload.new as { id: string };
            const { data } = await supabase
              .from("collab_applications")
              .select(
                "id, collab_id, applicant_id, status, message, created_at, profiles!collab_applications_applicant_id_fkey(name, nickname, avatar_url, affiliation, job_title, region, keywords)",
              )
              .eq("id", newRow.id)
              .maybeSingle();
            if (!data) return;
            const r = data as any;
            const p = r.profiles ?? null;
            const nickname = p?.nickname?.trim() ?? "";
            const name = p?.name?.trim() ?? "";
            const status = (r.status ?? "pending") as AppStatus;
            if (status !== "pending" && status !== "accepted") return;
            const incoming: Application = {
              id: r.id,
              collab_id: r.collab_id,
              applicant_id: r.applicant_id,
              status,
              message: r.message,
              created_at: r.created_at,
              applicant_name: nickname || name || null,
              applicant_avatar_url: p?.avatar_url ?? null,
              applicant_affiliation: p?.affiliation ?? null,
              applicant_job_title: p?.job_title ?? null,
              applicant_region: p?.region ?? null,
              applicant_keywords: p?.keywords ?? null,
            };
            setApplications((prev) => {
              if (prev.some((a) => a.id === incoming.id)) return prev;
              return [incoming, ...prev];
            });
          } else if (payload.eventType === "UPDATE") {
            const newRow = payload.new as {
              id: string;
              status: string;
              message: string | null;
            };
            const status = newRow.status as AppStatus;
            if (status !== "pending" && status !== "accepted") {
              setApplications((prev) =>
                prev.filter((a) => a.id !== newRow.id),
              );
            } else {
              setApplications((prev) =>
                prev.map((a) =>
                  a.id === newRow.id
                    ? { ...a, status, message: newRow.message }
                    : a,
                ),
              );
            }
          } else if (payload.eventType === "DELETE") {
            const oldRow = payload.old as { id: string };
            setApplications((prev) => prev.filter((a) => a.id !== oldRow.id));
          }
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [myCollabIds]);

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

  const confirmDecline = async () => {
    const target = declineTarget;
    if (!target) return;
    setDeclineTarget(null);
    const prev = applications;
    setApplications((list) => list.filter((a) => a.id !== target.id));

    // pending → declined. 신청자는 my-applications에서 "거절됨"으로 확인.
    // status guard로 withdrawn 등 다른 상태를 덮어쓰지 않도록.
    const supabase = createClient();
    const { error } = await supabase
      .from("collab_applications")
      .update({ status: "declined" })
      .eq("id", target.id)
      .eq("status", "pending");
    if (error) {
      console.error(
        "[my-collabs] decline failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      setApplications(prev);
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


  const openChat = async (app: Application, collab: CollabRow) => {
    const roomId = await findOrCreateChatRoom(collab.id, app.applicant_id);
    if (!roomId) return;
    router.push(`/chat?id=${encodeURIComponent(roomId)}`);
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
          const applicants = applications.filter((a) => a.collab_id === c.id);
          const pendingApplicants = applicants.filter((a) => a.status === "pending");
          return (
            <CollabCard
              key={c.id}
              domId={`collab-${c.id}`}
              item={{
                id: c.id,
                authorNickname: c.authorNickname,
                authorAvatarUrl: c.authorAvatarUrl,
                kind: c.kind,
                title: c.title,
                description: c.desc,
                period: formatPeriod(c.period),
                location: c.location?.trim() || undefined,
                photos: c.photos,
              }}
              expanded={expanded.has(c.id)}
              onToggle={() => toggle(c.id)}
              onAuthorClick={() => setViewProfileUserId(c.authorId)}
              rightTop={
                <div className="flex items-start gap-1.5">
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
              }
              expandedActions={
                <>
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <UserPlus size={12} className="text-[#4a4d22] dark:text-[#d4d8a8]" />
                      <h4 className="text-xs font-semibold text-text-1">
                        참여 요청 {applicants.length}
                      </h4>
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
                            <div
                              role="button"
                              tabIndex={0}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewProfileUserId(a.applicant_id);
                              }}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  e.preventDefault();
                                  setViewProfileUserId(a.applicant_id);
                                }
                              }}
                              className="inline-flex items-center gap-2 cursor-pointer rounded-full -m-1 p-1 pr-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors w-fit max-w-full"
                            >
                              <span
                                className={`w-8 h-8 shrink-0 rounded-full text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden ${
                                  a.status === "accepted" ? "bg-emerald-600" : "bg-[#999f54]"
                                }`}
                              >
                                {a.applicant_avatar_url ? (
                                  /* eslint-disable-next-line @next/next/no-img-element */
                                  <img
                                    src={a.applicant_avatar_url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <User size={16} strokeWidth={1.75} />
                                )}
                              </span>
                              <span className="text-xs font-semibold text-text-1 truncate">
                                {applicantLabel(a)}
                              </span>
                              {a.status === "accepted" && (
                                <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 shrink-0">
                                  <Check size={10} />
                                  수락됨
                                </span>
                              )}
                            </div>
                            {a.message && (
                              <p className="mt-2 text-[11px] text-text-4 whitespace-pre-wrap">
                                {a.message}
                              </p>
                            )}
                            <div className="mt-2 flex gap-2 items-center justify-end flex-wrap">
                              {a.status === "pending" && (
                                <button
                                  onClick={() => setDeclineTarget(a)}
                                  className="inline-flex items-center text-[11px] px-3 py-1.5 rounded-full border border-transparent underline text-text-6 hover:text-text-4 font-semibold"
                                >
                                  다음 기회에
                                </button>
                              )}
                              <button
                                onClick={() =>
                                  a.status === "accepted"
                                    ? openChat(a, c)
                                    : setChatTarget({ app: a, collab: c })
                                }
                                className="inline-flex items-center gap-1 text-[11px] px-3 py-1.5 rounded-full border border-[#999f54]/40 text-[#4a4d22] dark:text-[#d4d8a8] hover:bg-[#999f54]/10 font-semibold"
                              >
                                <MessageCircle size={12} />
                                {a.status === "accepted" ? "채팅 열기" : "대화 시작하기"}
                              </button>
                              {a.status === "pending" && (
                                <button
                                  onClick={() => setAcceptTarget(a)}
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
                </>
              }
            />
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
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
        title="대화 시작하기"
        size="sm"
      >
        {chatTarget && (() => {
          const a = chatTarget.app;
          return (
            <div className="flex flex-col gap-5">
              <div className="text-sm text-text-3 leading-relaxed space-y-2">
                <p>
                  <span className="font-semibold text-text-1">{applicantLabel(a)}</span>
                  님과 대화를 시작할까요?
                </p>
              </div>
              <div className="rounded-lg p-2.5 border bg-[#999f54]/8 border-[#999f54]/20">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
                    {a.applicant_avatar_url ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={a.applicant_avatar_url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User size={16} strokeWidth={1.75} />
                    )}
                  </span>
                  <div className="text-xs font-semibold text-text-1 truncate">
                    {applicantLabel(a)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setChatTarget(null)}
                  className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const t = chatTarget;
                    setChatTarget(null);
                    if (t) openChat(t.app, t.collab);
                  }}
                  className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
                >
                  대화 시작
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>

      <Modal
        open={!!acceptTarget}
        onClose={() => setAcceptTarget(null)}
        title="신청 수락"
        size="sm"
      >
        {acceptTarget && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-text-3 leading-relaxed">
              수락한 후에는 되돌릴 수 없어요.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setAcceptTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => {
                  const t = acceptTarget;
                  setAcceptTarget(null);
                  if (t) acceptApplication(t);
                }}
                className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
              >
                수락
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        open={!!declineTarget}
        onClose={() => setDeclineTarget(null)}
        title="다음 기회에 응답"
        size="sm"
      >
        {declineTarget && (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-text-3 leading-relaxed">
              이 신청은 사라지고 되돌릴 수 없어요.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDeclineTarget(null)}
                className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4"
              >
                취소
              </button>
              <button
                type="button"
                onClick={confirmDecline}
                className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
              >
                거절
              </button>
            </div>
          </div>
        )}
      </Modal>

      <ProfileModal
        userId={viewProfileUserId}
        onClose={() => setViewProfileUserId(null)}
      />
    </div>
  );
}
