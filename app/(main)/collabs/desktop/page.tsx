"use client";

import {
  Check,
  ChevronDown,
  LayoutGrid,
  List,
  SlidersHorizontal,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import CollabCard from "../../../_components/collab-card";
import PhotoCard from "../../../_components/photo-card";
import ProfileModal from "../../../_components/profile-modal";
import { HOME_CATEGORIES } from "../../../data/categories";
import { type CollabKind } from "../../../data/collabs";
import { formatPeriod, periodFromColumns } from "../../../period-utils";
import { createClient } from "@/lib/supabase/client";

type Status = "all" | "recruiting" | "ongoing" | "done";
type View = "text" | "photo";

const STATUS_CHIPS: ReadonlyArray<{ key: Status; label: string }> = [
  { key: "all", label: "전체" },
  { key: "recruiting", label: "모집중" },
  { key: "ongoing", label: "진행중" },
  { key: "done", label: "완료" },
];

const STATUS_DB: Record<Exclude<Status, "all">, string> = {
  recruiting: "recruiting",
  ongoing: "in_progress",
  done: "done",
};

const DB_TO_LABEL: Record<string, string> = {
  recruiting: "모집중",
  in_progress: "진행중",
  done: "완료",
};

const STATUS_BADGE_CLASS: Record<string, string> = {
  recruiting:
    "bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border-[#999f54]/30",
  in_progress:
    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
  done: "bg-black/5 dark:bg-white/10 text-text-4 border-black/10 dark:border-white/15",
};

type Row = {
  id: string;
  authorId: string;
  authorNickname: string;
  authorAvatarUrl: string | null;
  kind: CollabKind;
  title: string;
  description: string;
  period: string;
  location: string;
  photos: string[];
  statusDb: string;
};

export default function Page() {
  const [status, setStatus] = useState<Status>("all");
  const [view, setView] = useState<View>("text");
  const [rows, setRows] = useState<Row[]>([]);
  const [kind, setKind] = useState<CollabKind | "전체">("전체");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [viewProfileUserId, setViewProfileUserId] = useState<string | null>(null);

  // explore의 "내 조건 맞추기" 행 — 전문가/분야/조건 드롭다운 (UI만)
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
      let query = supabase
        .from("collabs")
        .select(
          "id, title, description, status, period_start, period_end, period_start_time, period_end_time, location, " +
            "collab_kinds(label), " +
            "profiles!collabs_author_id_fkey(id, name, nickname, avatar_url), " +
            "collab_photos(image_url, position)",
        )
        .order("created_at", { ascending: false });
      if (status === "all") {
        query = query.in("status", ["recruiting", "in_progress", "done"]);
      } else {
        query = query.eq("status", STATUS_DB[status]);
      }
      const { data } = await query;
      if (!data) return;
      const mapped = (data as any[]).map((r): Row => {
        const p = r.profiles ?? null;
        const nickname = p?.nickname?.trim() || p?.name?.trim() || "익명";
        const photos = (r.collab_photos ?? []) as Array<{
          image_url: string;
          position: number;
        }>;
        const sorted = photos
          .slice()
          .sort((a, b) => a.position - b.position)
          .map((x) => x.image_url);
        return {
          id: r.id,
          authorId: p?.id ?? "",
          authorNickname: nickname,
          authorAvatarUrl: p?.avatar_url ?? null,
          kind: (r.collab_kinds?.label ?? "") as CollabKind,
          title: r.title,
          description: r.description ?? "",
          period: formatPeriod(
            periodFromColumns({
              period_start: r.period_start,
              period_end: r.period_end,
              period_start_time: r.period_start_time,
              period_end_time: r.period_end_time,
            }),
          ),
          location: r.location ?? "",
          photos: sorted,
          statusDb: r.status ?? "",
        };
      });
      setRows(mapped);
      setExpanded(new Set());
    })();
  }, [status]);

  const items = useMemo(
    () => (kind === "전체" ? rows : rows.filter((r) => r.kind === kind)),
    [kind, rows],
  );

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="min-h-[100dvh] flex flex-col items-center">
      <div className="w-full max-w-2xl bg-surface border-x border-black/10 dark:border-white/10 flex-1 flex flex-col">
      <div className="sticky top-0 z-10 bg-surface border-b border-black/10 dark:border-white/10 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1.5 w-max items-center">
          <span className="shrink-0 inline-flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-semibold text-[#4a4d22] dark:text-[#d4d8a8] bg-[#999f54]/10 border border-[#999f54]/30">
            <SlidersHorizontal size={11} />
            상태
          </span>
          {STATUS_CHIPS.map(({ key, label }) => {
            const active = status === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setStatus(key)}
                className={`flex items-center px-3 py-1.5 rounded-full text-xs whitespace-nowrap border font-semibold ${
                  active
                    ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                    : "bg-surface text-text-4 border-black/15 dark:border-white/15 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sticky top-[44px] z-10 bg-surface border-b border-black/5 dark:border-white/5 px-3 py-2 overflow-x-auto">
        <div className="flex gap-1.5 w-max items-center">
          <span className="shrink-0 inline-flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-semibold text-[#4a4d22] dark:text-[#d4d8a8] bg-[#999f54]/10 border border-[#999f54]/30">
            <SlidersHorizontal size={11} />
            종류
          </span>
          <button
            onClick={() => setKind("전체")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs whitespace-nowrap border ${
              kind === "전체"
                ? "bg-[#999f54] text-[#F2F0DC] border-[#999f54]"
                : "bg-surface text-text-4 border-black/15 dark:border-white/15"
            }`}
          >
            전체
          </button>
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
            <span className="shrink-0 inline-flex items-center gap-1 pl-2 pr-2.5 py-1 rounded-full text-[11px] font-semibold text-[#4a4d22] dark:text-[#d4d8a8] bg-[#999f54]/10 border border-[#999f54]/30">
              <SlidersHorizontal size={11} />
              조건
            </span>
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

      <main className="flex-1 px-4 py-4 pb-24 w-full">
        <div className="flex justify-between items-center mb-3">
          <p className="text-[11px] text-text-5">
            {items.length}건 — 카드 스타일을 비교해보세요
          </p>
          <div className="inline-flex rounded-full border border-black/10 dark:border-white/15 overflow-hidden">
            <button
              type="button"
              onClick={() => setView("text")}
              aria-pressed={view === "text"}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium ${
                view === "text"
                  ? "bg-[#999f54] text-[#F2F0DC]"
                  : "text-text-5 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <List size={12} />
              텍스트 카드
            </button>
            <button
              type="button"
              onClick={() => setView("photo")}
              aria-pressed={view === "photo"}
              className={`inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium border-l border-black/10 dark:border-white/15 ${
                view === "photo"
                  ? "bg-[#999f54] text-[#F2F0DC]"
                  : "text-text-5 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              <LayoutGrid size={12} />
              사진 카드
            </button>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm p-6 text-center">
            <p className="text-xs text-text-5">
              {STATUS_CHIPS.find((s) => s.key === status)?.label}{" "}
              {kind === "전체" ? "" : kind + " "}협업이 없어요.
            </p>
          </div>
        ) : view === "text" ? (
          <ul className="space-y-3">
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
                  description: it.description,
                  period: it.period,
                  location: it.location || undefined,
                  photos: it.photos,
                }}
                expanded={expanded.has(it.id)}
                onToggle={() => toggleExpand(it.id)}
                onAuthorClick={() =>
                  it.authorId && setViewProfileUserId(it.authorId)
                }
                rightTop={
                  DB_TO_LABEL[it.statusDb] ? (
                    <span
                      className={`inline-flex items-center text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                        STATUS_BADGE_CLASS[it.statusDb] ?? ""
                      }`}
                    >
                      {DB_TO_LABEL[it.statusDb]}
                    </span>
                  ) : null
                }
              />
            ))}
          </ul>
        ) : (
          <ul className="grid grid-cols-2 gap-3">
            {items.map((it) => (
              <PhotoCard
                key={it.id}
                image={it.photos[0] ?? null}
                kind={it.kind}
                title={it.title}
                host={it.authorNickname}
                period={it.period}
                location={it.location}
                href={`/collabs/desktop/${it.id}`}
                rightTopBadge={
                  DB_TO_LABEL[it.statusDb] ? (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                        STATUS_BADGE_CLASS[it.statusDb] ?? ""
                      }`}
                    >
                      {DB_TO_LABEL[it.statusDb]}
                    </span>
                  ) : null
                }
              />
            ))}
          </ul>
        )}
      </main>

        <ProfileModal
          userId={viewProfileUserId}
          onClose={() => setViewProfileUserId(null)}
        />
      </div>
    </div>
  );
}
