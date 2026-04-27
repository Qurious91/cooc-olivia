"use client";

import { CheckCircle2, User, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import Modal from "../../modal";
import CollabCard from "../../_components/collab-card";
import ProfileModal from "../../_components/profile-modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type Role = "host" | "member";

type Participant = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

type WorkItem = {
  id: string;
  kind: CollabKind;
  title: string;
  desc: string;
  role: Role;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  period: string;
  location: string;
  photos: string[];
  participants: Participant[];
};

export default function ActiveWorks({ onCompleted }: { onCompleted?: () => void }) {
  const [items, setItems] = useState<WorkItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [completeTarget, setCompleteTarget] = useState<WorkItem | null>(null);
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

      const collabSelect =
        "id, title, description, period_start, period_end, period_start_time, period_end_time, location, " +
        "collab_kinds(label), " +
        "profiles!collabs_author_id_fkey(id, name, nickname, avatar_url), " +
        "collab_photos(image_url, position)";

      const [hostRes, memberRes] = await Promise.all([
        supabase
          .from("collabs")
          .select(collabSelect)
          .eq("author_id", user.id)
          .eq("status", "in_progress")
          .order("updated_at", { ascending: false }),
        supabase
          .from("collab_applications")
          .select(`id, collabs!inner(${collabSelect}, status)`)
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

      const buildItem = (c: any, role: Role): WorkItem => {
        const p = c.profiles ?? null;
        const nickname = p?.nickname?.trim() ?? "";
        const name = p?.name?.trim() ?? "";
        const photoRows = (c.collab_photos ?? []) as Array<{
          image_url: string;
          position: number;
        }>;
        const photos = photoRows
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((x) => x.image_url);
        return {
          id: c.id,
          kind: (c.collab_kinds?.label ?? "") as CollabKind,
          title: c.title,
          desc: c.description ?? "",
          role,
          authorId: p?.id ?? "",
          authorNickname: nickname || name || "익명",
          authorAvatarUrl: p?.avatar_url ?? null,
          period: formatPeriod(
            periodFromColumns({
              period_start: c.period_start,
              period_end: c.period_end,
              period_start_time: c.period_start_time,
              period_end_time: c.period_end_time,
            }),
          ),
          location: c.location ?? "",
          photos,
          participants: [],
        };
      };

      const hostItems = (hostRes.data ?? []).map((r: any) => buildItem(r, "host"));
      const memberItems = (memberRes.data ?? [])
        .map((r: any): WorkItem | null => {
          const c = r.collabs;
          if (!c) return null;
          return buildItem(c, "member");
        })
        .filter((x): x is WorkItem => x !== null);

      const seen = new Set<string>();
      const merged: WorkItem[] = [];
      for (const it of [...hostItems, ...memberItems]) {
        if (seen.has(it.id)) continue;
        seen.add(it.id);
        merged.push(it);
      }

      // accepted된 참여자 프로필을 collab별로 묶어서 attach
      if (merged.length > 0) {
        const ids = merged.map((m) => m.id);
        const { data: parts } = await supabase
          .from("collab_applications")
          .select(
            "collab_id, profiles!collab_applications_applicant_id_fkey(id, nickname, name, avatar_url)",
          )
          .in("collab_id", ids)
          .eq("status", "accepted");
        if (parts) {
          const byCollab = new Map<string, Participant[]>();
          for (const r of parts as any[]) {
            const p = r.profiles;
            if (!p) continue;
            const nickname =
              p.nickname?.trim() || p.name?.trim() || "익명";
            const list = byCollab.get(r.collab_id) ?? [];
            list.push({
              id: p.id,
              nickname,
              avatarUrl: p.avatar_url ?? null,
            });
            byCollab.set(r.collab_id, list);
          }
          for (const m of merged) {
            m.participants = byCollab.get(m.id) ?? [];
          }
        }
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
        {items.map((w) => (
          <CollabCard
            key={w.id}
            item={{
              id: w.id,
              authorId: w.authorId,
              authorNickname: w.authorNickname,
              authorAvatarUrl: w.authorAvatarUrl,
              kind: w.kind,
              title: w.title,
              description: w.desc,
              period: w.period,
              location: w.location || undefined,
              photos: w.photos,
            }}
            expanded={expanded.has(w.id)}
            onToggle={() => toggleExpand(w.id)}
            onAuthorClick={() =>
              w.authorId && setViewProfileUserId(w.authorId)
            }
            rightTop={
              <span
                className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                  w.role === "host"
                    ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
                    : "bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border-[#999f54]/30 dark:border-[#999f54]/40"
                }`}
              >
                {w.role === "host" ? "주최" : "참여"}
              </span>
            }
            expandedActions={
              <>
                {w.participants.length > 0 && (
                  <div>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Users size={12} className="text-[#4a4d22] dark:text-[#d4d8a8]" />
                      <h4 className="text-xs font-semibold text-text-1">
                        참여자 {w.participants.length}
                      </h4>
                    </div>
                    <ul className="flex flex-wrap gap-x-1 gap-y-2">
                      {w.participants.map((p) => (
                        <li key={p.id}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewProfileUserId(p.id);
                            }}
                            className="inline-flex items-center gap-2 cursor-pointer rounded-full -m-1 p-1 pr-2 hover:bg-black/[0.04] dark:hover:bg-white/[0.05] transition-colors"
                          >
                            <span className="w-8 h-8 shrink-0 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
                              {p.avatarUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                  src={p.avatarUrl}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User size={16} strokeWidth={1.75} />
                              )}
                            </span>
                            <span className="text-xs font-semibold text-text-1 truncate max-w-[140px]">
                              {p.nickname}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
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
              </>
            }
          />
        ))}
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

      <ProfileModal
        userId={viewProfileUserId}
        onClose={() => setViewProfileUserId(null)}
      />
    </>
  );
}
