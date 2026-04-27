"use client";

import { Check, CheckCircle2, ChevronDown, ImagePlus, User, Users, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import CollabCard from "../../_components/collab-card";
import ProfileModal from "../../_components/profile-modal";
import Modal from "../../modal";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { type CollabKind } from "../../data/collabs";
import { createClient } from "@/lib/supabase/client";

type Participant = {
  id: string;
  nickname: string;
  avatarUrl: string | null;
};

type CompletedItem = {
  id: string;
  kind: CollabKind;
  title: string;
  desc: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  completedAt: string;
  period: string;
  location: string;
  photos: string[];
  participants: Participant[];
  publishedAt: string | null;
  isHost: boolean;
};

export default function CompletedWorks({ refreshKey = 0 }: { refreshKey?: number }) {
  const [items, setItems] = useState<CompletedItem[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<CompletedItem | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const collabSelect =
        "id, title, description, period_start, period_end, period_start_time, period_end_time, location, updated_at, archive_published_at, author_id, " +
        "collab_kinds(label), " +
        "profiles!collabs_author_id_fkey(id, name, nickname, avatar_url), " +
        "collab_photos(image_url, position)";

      const [hostRes, memberRes] = await Promise.all([
        supabase
          .from("collabs")
          .select(collabSelect)
          .eq("author_id", user.id)
          .eq("status", "done")
          .order("updated_at", { ascending: false }),
        supabase
          .from("collab_applications")
          .select(`id, collabs!inner(${collabSelect}, status)`)
          .eq("applicant_id", user.id)
          .eq("status", "accepted")
          .eq("collabs.status", "done"),
      ]);

      if (hostRes.error) {
        console.error(
          "[completed-works] host select failed",
          hostRes.error.message,
          hostRes.error.details,
          hostRes.error.hint,
          hostRes.error.code,
        );
      }
      if (memberRes.error) {
        console.error(
          "[completed-works] member select failed",
          memberRes.error.message,
          memberRes.error.details,
          memberRes.error.hint,
          memberRes.error.code,
        );
      }

      const buildItem = (c: any): CompletedItem => {
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
          authorId: p?.id ?? "",
          authorNickname: nickname || name || "익명",
          authorAvatarUrl: p?.avatar_url ?? null,
          completedAt: c.updated_at,
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
          publishedAt: c.archive_published_at ?? null,
          isHost: c.author_id === user.id,
        };
      };

      const hostItems = (hostRes.data ?? []).map(buildItem);
      const memberItems = (memberRes.data ?? [])
        .map((r: any): CompletedItem | null => {
          const c = r.collabs;
          if (!c) return null;
          return buildItem(c);
        })
        .filter((x): x is CompletedItem => x !== null);

      const seen = new Set<string>();
      const merged: CompletedItem[] = [];
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
    })();
  }, [refreshKey, reloadKey]);

  const toggleItem = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  if (items.length === 0) return null;

  return (
    <section className="mt-8 border-t border-black/10 dark:border-white/10 pt-6">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between text-xs font-semibold text-text-4"
      >
        <span className="inline-flex items-center gap-1.5">
          <CheckCircle2 size={14} className="text-[#999f54]" />
          완료한 협업 {items.length}
        </span>
        <ChevronDown
          size={14}
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="mt-3 space-y-3">
          {items.map((it) => (
            <CollabCard
              key={it.id}
              item={{
                id: it.id,
                authorId: it.authorId,
                authorNickname: it.authorNickname,
                authorAvatarUrl: it.authorAvatarUrl,
                kind: it.kind,
                title: it.title,
                description: it.desc,
                period: it.period,
                location: it.location || undefined,
                photos: it.photos,
              }}
              expanded={expanded.has(it.id)}
              onToggle={() => toggleItem(it.id)}
              onAuthorClick={() =>
                it.authorId && setViewProfileUserId(it.authorId)
              }
              rightTop={
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold bg-black/5 dark:bg-white/10 text-text-4 border-black/10 dark:border-white/15">
                    <CheckCircle2 size={11} />
                    완료 {new Date(it.completedAt).toLocaleDateString("ko-KR")}
                  </span>
                  {it.isHost &&
                    (it.publishedAt ? (
                      <span className="inline-flex items-center gap-0.5 text-[10px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        <Check size={10} />
                        공개됨
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        비공개
                      </span>
                    ))}
                </div>
              }
              expandedActions={
                <>
                  {it.participants.length > 0 && (
                    <div>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Users size={12} className="text-[#4a4d22] dark:text-[#d4d8a8]" />
                        <h4 className="text-xs font-semibold text-text-1">
                          참여자 {it.participants.length}
                        </h4>
                      </div>
                      <ul className="flex flex-wrap gap-x-1 gap-y-2">
                        {it.participants.map((p) => (
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
                  {it.isHost && !it.publishedAt && (
                    <button
                      type="button"
                      onClick={() => setPublishTarget(it)}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
                    >
                      <ImagePlus size={14} />
                      사진을 추가하여 공개하기
                    </button>
                  )}
                </>
              }
            />
          ))}
        </ul>
      )}
      <ProfileModal
        userId={viewProfileUserId}
        onClose={() => setViewProfileUserId(null)}
      />

      <PublishArchiveModal
        target={publishTarget}
        userId={userId}
        onClose={() => setPublishTarget(null)}
        onDone={() => {
          setPublishTarget(null);
          setReloadKey((k) => k + 1);
        }}
      />
    </section>
  );
}

function PublishArchiveModal({
  target,
  userId,
  onClose,
  onDone,
}: {
  target: CompletedItem | null;
  userId: string | null;
  onClose: () => void;
  onDone: () => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!target) {
      setFiles([]);
      setSubmitting(false);
    }
  }, [target]);

  const previews = files.map((f) => URL.createObjectURL(f));

  useEffect(() => {
    return () => {
      previews.forEach((u) => URL.revokeObjectURL(u));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  const onPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list) return;
    const arr = Array.from(list);
    setFiles((prev) => [...prev, ...arr].slice(0, 12));
    e.target.value = "";
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    if (!target || !userId) return;
    setSubmitting(true);
    const supabase = createClient();

    if (files.length > 0) {
      const { count: existingCount } = await supabase
        .from("collab_photos")
        .select("id", { count: "exact", head: true })
        .eq("collab_id", target.id);
      const baseIndex = existingCount ?? 0;

      const uploaded = await Promise.all(
        files.map(async (file) => {
          const ext = file.name.split(".").pop() || "bin";
          const filename = `${crypto.randomUUID()}.${ext}`;
          const path = `${userId}/${target.id}/${filename}`;
          const { error } = await supabase.storage
            .from("collab")
            .upload(path, file, { upsert: false });
          if (error) return null;
          const { data: pub } = supabase.storage
            .from("collab")
            .getPublicUrl(path);
          return pub.publicUrl;
        }),
      );
      const rows = uploaded
        .map((url, i) =>
          url
            ? {
                collab_id: target.id,
                image_url: url,
                position: baseIndex + i,
              }
            : null,
        )
        .filter((r): r is NonNullable<typeof r> => !!r);
      if (rows.length > 0) {
        await supabase.from("collab_photos").insert(rows);
      }
    }

    await supabase
      .from("collabs")
      .update({ archive_published_at: new Date().toISOString() })
      .eq("id", target.id);

    setSubmitting(false);
    onDone();
  };

  return (
    <Modal open={!!target} onClose={onClose} title="아카이브에 공개하기" size="md">
      {target && (
        <div className="flex flex-col gap-4">
          <div className="text-sm text-text-3 leading-relaxed">
            <span className="font-semibold text-text-1">{target.title}</span>
            을(를) 누구나 볼 수 있는 아카이브에 올립니다. 결과 사진을 함께 추가해보세요.
          </div>

          <div>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full py-3 rounded-lg border border-dashed border-black/15 dark:border-white/15 text-sm text-text-4 hover:bg-black/[0.02] dark:hover:bg-white/[0.04] inline-flex items-center justify-center gap-1.5"
            >
              <ImagePlus size={14} />
              사진 선택 ({files.length}/12)
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={onPick}
            />
          </div>

          {previews.length > 0 && (
            <ul className="grid grid-cols-3 gap-2">
              {previews.map((url, i) => (
                <li
                  key={i}
                  className="aspect-square rounded-lg overflow-hidden bg-black/5 dark:bg-white/5 relative"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60 text-white inline-flex items-center justify-center hover:bg-black/80"
                  >
                    <X size={12} />
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-sm text-text-4 disabled:opacity-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={submitting}
              className="flex-[2] py-2.5 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? "공개하는 중…" : "공개하기"}
            </button>
          </div>
        </div>
      )}
    </Modal>
  );
}
