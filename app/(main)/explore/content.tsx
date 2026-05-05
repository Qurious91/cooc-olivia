"use client";

import { ArrowLeft, Check, ChevronDown, Heart, Pencil, SlidersHorizontal, Trash2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import FabNewCollab from "../fab-new-collab";
import Modal from "../../modal";
import CollabCard from "../../_components/collab-card";
import ProfileModal from "../../_components/profile-modal";
import ApplyModal, { type ApplyPayload } from "./apply-modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
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
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  title: string;
  meta: string;
  location: string;
  mine?: boolean;
  desc?: string;
  detail?: string;
  period?: string;
  photos: string[];
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
      authorId: string;
      authorNickname: string;
      authorAvatarUrl: string | null;
      title: string;
      description: string;
      period: string | null;
      location: string | null;
      createdAt: string;
      photos: string[];
    }>
  >([]);
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const [applyTarget, setApplyTarget] = useState<ViewItem | null>(null);
  const [expertFilter, setExpertFilter] = useState<string | null>(null);
  const [expertOpen, setExpertOpen] = useState(false);
  const expertRef = useRef<HTMLDivElement>(null);
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [domainOpen, setDomainOpen] = useState(false);
  const domainRef = useRef<HTMLDivElement>(null);
  const [conditionFilter, setConditionFilter] = useState<string | null>(null);
  const [conditionOpen, setConditionOpen] = useState(false);
  const conditionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!expertOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!expertRef.current?.contains(e.target as Node)) setExpertOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [expertOpen]);

  useEffect(() => {
    if (!domainOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!domainRef.current?.contains(e.target as Node)) setDomainOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [domainOpen]);

  useEffect(() => {
    if (!conditionOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!conditionRef.current?.contains(e.target as Node))
        setConditionOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [conditionOpen]);

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
        .select("id, author_id, author, title, description, period_start, period_end, period_start_time, period_end_time, location, created_at, collab_kinds(label), profiles!collabs_author_id_fkey(name, nickname, avatar_url, affiliation), collab_photos(image_url, position)")
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
          const nickname = r.profiles?.nickname?.trim() ?? "";
          const aff = r.profiles?.affiliation?.trim() ?? "";
          const avatarUrl = r.profiles?.avatar_url ?? null;
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
          const photoRows = (r.collab_photos ?? []) as Array<{
            image_url: string;
            position: number;
          }>;
          const photos = photoRows
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((p) => p.image_url);
          return {
            id: r.id,
            kind: r.collab_kinds?.label ?? "",
            mine: isMine,
            host,
            authorId: r.author_id,
            authorNickname: nickname || name || "익명",
            authorAvatarUrl: avatarUrl,
            title: r.title,
            description: r.description,
            photos,
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
    const { error } = await supabase.from("collabs").delete().eq("id", id);
    if (error) {
      console.error(
        "[explore] delete failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      return;
    }
    setDbRows((prev) => prev.filter((r) => r.id !== id));
  };

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const submitApplication = async (collabId: string, payload: ApplyPayload) => {
    setApplied((prev) => {
      const next = new Set(prev);
      next.add(collabId);
      return next;
    });
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const rollback = () =>
      setApplied((prev) => {
        const next = new Set(prev);
        next.delete(collabId);
        return next;
      });
    if (!user) {
      rollback();
      return;
    }
    const { error } = await supabase
      .from("collab_applications")
      .upsert(
        {
          collab_id: collabId,
          applicant_id: user.id,
          status: "pending",
          message: payload.message,
          applicant_name: null,
          applicant_avatar_url: null,
          applicant_affiliation: null,
          applicant_job_title: null,
          applicant_region: null,
          applicant_keywords: null,
        },
        { onConflict: "collab_id,applicant_id" },
      );
    if (error) {
      console.error(
        "[explore] submit application failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
      rollback();
    }
  };

  const items: ViewItem[] = useMemo(
    () =>
      dbRows
        .filter((r) => r.kind === kind)
        .map((r) => ({
          id: r.id,
          host: r.host,
          authorId: r.authorId,
          authorNickname: r.authorNickname,
          authorAvatarUrl: r.authorAvatarUrl,
          title: r.title,
          meta:
            formatPeriod(r.period) ||
            new Date(r.createdAt).toLocaleDateString("ko-KR"),
          location: r.location?.trim() || (r.mine ? "내 게시물" : ""),
          mine: r.mine,
          desc: r.description,
          detail: r.description,
          period: r.period ?? undefined,
          photos: r.photos,
        })),
    [kind, dbRows],
  );

  return (
    <div className="min-h-[100dvh] flex flex-col bg-surface">
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

      {kind === "게스트 초청" && (
        <div className="bg-surface border-b border-black/5 dark:border-white/5 px-3 py-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              disabled
              title="준비중"
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] whitespace-nowrap border border-dashed border-[#999f54]/40 bg-surface text-text-4 cursor-not-allowed shrink-0"
            >
              <SlidersHorizontal size={12} />
              내 조건 맞추기
              <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
                제작중
              </span>
            </button>
            <span className="text-text-6 text-[11px] shrink-0">|</span>
            <div ref={expertRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setExpertOpen((v) => !v)}
                aria-expanded={expertOpen}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] whitespace-nowrap border ${
                  expertFilter
                    ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                    : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                }`}
              >
                {expertFilter ?? "전문가"}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${expertOpen ? "rotate-180" : ""}`}
                />
              </button>
              {expertOpen && (
                <div className="absolute left-0 top-full mt-1 w-32 rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-lg overflow-hidden z-30">
                  {["셰프", "바텐더", "소믈리에"].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setExpertFilter(label);
                        setExpertOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 text-xs text-text-2 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <span>{label}</span>
                      {expertFilter === label && (
                        <Check size={12} className="text-[#999f54]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div ref={domainRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setDomainOpen((v) => !v)}
                aria-expanded={domainOpen}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] whitespace-nowrap border ${
                  domainFilter
                    ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                    : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                }`}
              >
                {domainFilter ?? "분야"}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${domainOpen ? "rotate-180" : ""}`}
                />
              </button>
              {domainOpen && (
                <div className="absolute left-0 top-full mt-1 w-32 rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-lg overflow-hidden z-30">
                  {["한식", "중식", "파인다이닝", "일식", "컨템프러리", "양식"].map(
                    (label) => (
                      <button
                        key={label}
                        type="button"
                        onClick={() => {
                          setDomainFilter(label);
                          setDomainOpen(false);
                        }}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs text-text-2 hover:bg-black/5 dark:hover:bg-white/5"
                      >
                        <span>{label}</span>
                        {domainFilter === label && (
                          <Check size={12} className="text-[#999f54]" />
                        )}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>
            <div ref={conditionRef} className="relative shrink-0">
              <button
                type="button"
                onClick={() => setConditionOpen((v) => !v)}
                aria-expanded={conditionOpen}
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] whitespace-nowrap border ${
                  conditionFilter
                    ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                    : "bg-surface text-text-4 border-black/15 dark:border-white/15"
                }`}
              >
                {conditionFilter ?? "조건"}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${conditionOpen ? "rotate-180" : ""}`}
                />
              </button>
              {conditionOpen && (
                <div className="absolute left-0 top-full mt-1 w-52 rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-lg overflow-hidden z-30">
                  {[
                    "미쉐린 레스토랑 근무 경험",
                    "소믈리에 자격증",
                    "해외 근무 경험",
                  ].map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => {
                        setConditionFilter(label);
                        setConditionOpen(false);
                      }}
                      className="w-full flex items-center justify-between gap-2 px-3 py-2 text-xs text-text-2 hover:bg-black/5 dark:hover:bg-white/5"
                    >
                      <span className="truncate">{label}</span>
                      {conditionFilter === label && (
                        <Check size={12} className="text-[#999f54] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-4 pb-24 max-w-xl w-full mx-auto">
        <p className="text-xs text-text-5 mb-3">
          {kind} 제안 {items.length}건
        </p>
        <ul className="space-y-3">
          {items.map((it) => (
            <CollabCard
              key={it.id}
              item={{
                id: it.id,
                authorId: it.authorId,
                authorNickname: it.authorNickname,
                authorAvatarUrl: it.authorAvatarUrl,
                kind,
                title: it.title,
                description: it.mine ? it.desc : it.detail,
                period: it.meta,
                location:
                  it.location && it.location !== "내 게시물"
                    ? it.location
                    : undefined,
                photos: it.photos,
              }}
              expanded={expanded.has(it.id)}
              onToggle={() => toggleExpand(it.id)}
              onAuthorClick={() => setViewProfileUserId(it.authorId)}
              className={
                it.mine
                  ? "border-[#999f54]/60"
                  : "border-black/10 dark:border-white/10"
              }
              rightTop={
                <button
                  onClick={() => toggleLike(it.id)}
                  aria-label={liked.has(it.id) ? "좋아요 취소" : "좋아요"}
                  aria-pressed={liked.has(it.id)}
                  className="p-1.5 -m-1 rounded-full hover:bg-black/5 dark:hover:bg-white/5"
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
              }
              expandedActions={
                it.mine ? (
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
                ) : (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        if (!applied.has(it.id)) setApplyTarget(it);
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
                )
              }
            />
          ))}
        </ul>
      </main>
      <FabNewCollab />

      <ApplyModal
        open={applyTarget !== null}
        onClose={() => setApplyTarget(null)}
        collabTitle={applyTarget?.title ?? ""}
        onSubmit={async (payload: ApplyPayload) => {
          const target = applyTarget;
          if (!target) return;
          await submitApplication(target.id, payload);
          setApplyTarget(null);
        }}
      />

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

      <ProfileModal
        userId={viewProfileUserId}
        onClose={() => setViewProfileUserId(null)}
      />
    </div>
  );
}
