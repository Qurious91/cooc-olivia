"use client";

import { CheckCircle2, Clock3, Search, X, XCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import CollabCard from "../../_components/collab-card";
import ProfileModal from "../../_components/profile-modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type ApplicationStatus = "pending" | "accepted" | "declined" | "withdrawn";

type AppItem = {
  id: string;
  collabId: string;
  kind: CollabKind;
  title: string;
  description: string;
  period: string;
  location: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  photos: string[];
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

export default function MyApplications({ initialOpenId }: { initialOpenId?: string }) {
  const [items, setItems] = useState<AppItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(
    initialOpenId ? new Set([initialOpenId]) : new Set(),
  );
  const [loaded, setLoaded] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);

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
      setUserId(user.id);
      const { data, error } = await supabase
        .from("collab_applications")
        .select(
          "id, collab_id, message, status, created_at, applicant_name, applicant_avatar_url, applicant_affiliation, applicant_job_title, applicant_region, applicant_keywords, " +
            "collabs(id, title, description, period_start, period_end, period_start_time, period_end_time, location, " +
            "collab_kinds(label), " +
            "profiles!collabs_author_id_fkey(id, name, nickname, avatar_url), " +
            "collab_photos(image_url, position))",
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
          const p = c.profiles ?? null;
          const nickname = p?.nickname?.trim() ?? "";
          const name = p?.name?.trim() ?? "";
          const period = periodFromColumns({
            period_start: c.period_start,
            period_end: c.period_end,
            period_start_time: c.period_start_time,
            period_end_time: c.period_end_time,
          });
          const photoRows = (c.collab_photos ?? []) as Array<{
            image_url: string;
            position: number;
          }>;
          const photos = photoRows
            .slice()
            .sort((a, b) => a.position - b.position)
            .map((x) => x.image_url);
          return {
            id: r.id,
            collabId: c.id,
            kind: (c.collab_kinds?.label ?? "") as CollabKind,
            title: c.title,
            description: c.description ?? "",
            period: formatPeriod(period),
            location: c.location?.trim() ?? "",
            authorId: p?.id ?? "",
            authorNickname: nickname || name || "익명",
            authorAvatarUrl: p?.avatar_url ?? null,
            photos,
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

  // 딥링크 — 헤더 알림에서 들어왔을 때 해당 카드 펼치고 스크롤
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
        .getElementById(`app-${initialOpenId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }, [initialOpenId]);

  // 작성자가 수락/거절하면 즉시 반영
  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    const channel = supabase
      .channel(`my-applications:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "collab_applications",
          filter: `applicant_id=eq.${userId}`,
        },
        (payload) => {
          const row = payload.new as { id: string; status: ApplicationStatus };
          setItems((prev) =>
            prev.map((i) => (i.id === row.id ? { ...i, status: row.status } : i)),
          );
        },
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (!loaded) return null;

  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
        <p className="text-xs text-text-5">아직 보낸 참여 요청이 없어요.</p>
        <Link
          href="/explore"
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border border-[#4a4d22] dark:border-[#d4d8a8] text-[#4a4d22] dark:text-[#d4d8a8] bg-transparent hover:bg-[#999f54]/5"
        >
          <Search size={14} />
          탐색하러 가기
        </Link>
      </div>
    );
  }

  return (
    <>
      <ul className="space-y-3">
        {items.map((it) => {
          const StatusIcon = STATUS_ICON[it.status];
          return (
            <CollabCard
              key={it.id}
              domId={`app-${it.id}`}
              item={{
                id: it.id,
                authorId: it.authorId,
                authorNickname: it.authorNickname,
                authorAvatarUrl: it.authorAvatarUrl,
                kind: it.kind,
                title: it.title,
                description: it.description,
                period: it.period,
                location: it.location || undefined,
                photos: it.photos,
              }}
              expanded={expanded.has(it.id)}
              onToggle={() => toggle(it.id)}
              onAuthorClick={() =>
                it.authorId && setViewProfileUserId(it.authorId)
              }
              rightTop={
                <span
                  className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${STATUS_CLASS[it.status]}`}
                >
                  <StatusIcon size={11} />
                  {STATUS_LABEL[it.status]}
                </span>
              }
              expandedActions={
                <>
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
                              {[
                                it.sharedAffiliation,
                                it.sharedJobTitle,
                                it.sharedRegion,
                              ]
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
                    <div className="rounded-lg bg-black/[0.02] dark:bg-white/[0.04] border border-black/5 dark:border-white/10 p-2.5">
                      <div className="text-[10px] font-semibold text-text-5 tracking-wider mb-1">
                        보낸 메시지
                      </div>
                      <p className="text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                        {it.message}
                      </p>
                    </div>
                  )}
                </>
              }
            />
          );
        })}
      </ul>

      <ProfileModal
        userId={viewProfileUserId}
        onClose={() => setViewProfileUserId(null)}
      />
    </>
  );
}
