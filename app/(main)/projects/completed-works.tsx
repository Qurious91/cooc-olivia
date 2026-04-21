"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { createClient } from "@/lib/supabase/client";

type CompletedItem = {
  id: string;
  title: string;
  partner: string;
  completedAt: string;
  period: string | null;
  desc: string;
};

export default function CompletedWorks({ refreshKey = 0 }: { refreshKey?: number }) {
  const [items, setItems] = useState<CompletedItem[]>([]);
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [hostRes, memberRes] = await Promise.all([
        supabase
          .from("collabs")
          .select(
            "id, author, title, description, period_start, period_end, period_start_time, period_end_time, updated_at, profiles!collabs_author_id_fkey(name, affiliation)",
          )
          .eq("author_id", user.id)
          .eq("status", "done")
          .order("updated_at", { ascending: false }),
        supabase
          .from("collab_applications")
          .select(
            "id, collabs!inner(id, author, title, description, period_start, period_end, period_start_time, period_end_time, status, updated_at, profiles!collabs_author_id_fkey(name, affiliation))",
          )
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

      const partnerLabel = (author: string, name: string, aff: string) =>
        author === "소속"
          ? aff || name || "익명"
          : author === "둘 다"
          ? [aff, name].filter(Boolean).join(" · ") || "익명"
          : name || "익명";

      const mapHost = (r: any): CompletedItem => ({
        id: r.id,
        title: r.title,
        partner: partnerLabel(r.author, r.profiles?.name ?? "", r.profiles?.affiliation ?? ""),
        completedAt: r.updated_at,
        period: periodFromColumns({
          period_start: r.period_start,
          period_end: r.period_end,
          period_start_time: r.period_start_time,
          period_end_time: r.period_end_time,
        }),
        desc: r.description ?? "",
      });

      const mapMember = (row: any): CompletedItem | null => {
        const c = row.collabs;
        if (!c) return null;
        return {
          id: c.id,
          title: c.title,
          partner: partnerLabel(c.author, c.profiles?.name ?? "", c.profiles?.affiliation ?? ""),
          completedAt: c.updated_at,
          period: periodFromColumns({
            period_start: c.period_start,
            period_end: c.period_end,
            period_start_time: c.period_start_time,
            period_end_time: c.period_end_time,
          }),
          desc: c.description ?? "",
        };
      };

      const hostItems = (hostRes.data ?? []).map(mapHost);
      const memberItems = (memberRes.data ?? [])
        .map(mapMember)
        .filter((x): x is CompletedItem => x !== null);

      const seen = new Set<string>();
      const merged: CompletedItem[] = [];
      for (const it of [...hostItems, ...memberItems]) {
        if (seen.has(it.id)) continue;
        seen.add(it.id);
        merged.push(it);
      }
      setItems(merged);
    })();
  }, [refreshKey]);

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
        <ul className="mt-3 space-y-2">
          {items.map((it) => {
            const exp = expanded.has(it.id);
            const periodLabel = formatPeriod(it.period);
            return (
              <li
                key={it.id}
                onClick={
                  it.desc
                    ? (e) => {
                        if ((e.target as HTMLElement).closest("button, a, input, [role='button']")) return;
                        toggleItem(it.id);
                      }
                    : undefined
                }
                className={`rounded-xl border border-black/5 dark:border-white/5 bg-surface p-3 ${
                  it.desc ? "cursor-pointer" : ""
                }`}
              >
                <div className="text-[11px] text-text-6">with {it.partner}</div>
                <div className="mt-0.5 text-sm font-semibold text-text-2 truncate">
                  {it.title}
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-text-6">
                  <span>완료 {new Date(it.completedAt).toLocaleDateString("ko-KR")}</span>
                  {periodLabel && <span>· {periodLabel}</span>}
                </div>
                {it.desc && (
                  <div className="mt-2 flex justify-end">
                    <button
                      onClick={() => toggleItem(it.id)}
                      aria-expanded={exp}
                      aria-label={exp ? "접기" : "자세히"}
                      className="inline-flex items-center gap-0.5 text-[11px] text-[#4a4d22] dark:text-[#d4d8a8]"
                    >
                      자세히
                      <ChevronDown
                        size={12}
                        className={`transition-transform ${exp ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                )}
                {exp && it.desc && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 pt-2 border-t border-black/5 dark:border-white/5"
                  >
                    <p className="text-[11px] text-text-4 whitespace-pre-wrap leading-relaxed">
                      {it.desc}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
