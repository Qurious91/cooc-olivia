"use client";

import { CalendarClock, ImagePlus, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPeriod, periodFromColumns } from "../../period-picker";
import { createClient } from "@/lib/supabase/client";

type ArchiveCollab = {
  id: string;
  kind: string;
  title: string;
  host: string;
  period: string;
  location: string;
  imageUrl: string | null;
};

export default function MyArchive() {
  const [items, setItems] = useState<ArchiveCollab[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    void loadItems();
  }, []);

  const loadItems = async () => {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("collabs")
      .select(
        "id, title, period_start, period_end, period_start_time, period_end_time, location, archive_published_at, " +
          "collab_kinds(label), " +
          "profiles!collabs_author_id_fkey(name, nickname), " +
          "collab_photos(image_url, position)",
      )
      .eq("status", "done")
      .not("archive_published_at", "is", null)
      .order("archive_published_at", { ascending: false });
    if (error) {
      console.error(
        "[archive] select failed",
        error.message,
        error.details,
        error.hint,
        error.code,
      );
    }
    if (!data) {
      setLoaded(true);
      return;
    }
    const mapped: ArchiveCollab[] = (data as any[]).map((r) => {
      const p = r.profiles ?? null;
      const host = p?.nickname?.trim() || p?.name?.trim() || "익명";
      const photos = (r.collab_photos ?? []) as Array<{
        image_url: string;
        position: number;
      }>;
      const sorted = photos.slice().sort((a, b) => a.position - b.position);
      return {
        id: r.id,
        kind: r.collab_kinds?.label ?? "",
        title: r.title,
        host,
        period: formatPeriod(
          periodFromColumns({
            period_start: r.period_start,
            period_end: r.period_end,
            period_start_time: r.period_start_time,
            period_end_time: r.period_end_time,
          }),
        ),
        location: r.location ?? "",
        imageUrl: sorted[0]?.image_url ?? null,
      };
    });
    setItems(mapped);
    setLoaded(true);
  };

  if (!loaded) return null;
  if (items.length === 0) return null;

  return (
    <section>
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-sm font-semibold text-text-1">공개된 협업</h2>
        <span className="text-[11px] text-text-6">{items.length}건</span>
      </div>
      <p className="text-[11px] text-text-5 mb-3">
        실제로 진행된 협업의 기록이에요.
      </p>

      <ul className="grid grid-cols-2 gap-3">
        {items.map((it) => (
          <li
            key={it.id}
            className="rounded-xl border border-black/10 dark:border-white/10 bg-surface shadow-sm overflow-hidden flex flex-col"
          >
            <Link href={`/archive/${it.id}`} className="flex-1 flex flex-col">
              <div className="aspect-[4/3] bg-black/5 dark:bg-white/5 relative">
                {it.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={it.imageUrl}
                    alt={it.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-6">
                    <ImagePlus size={28} />
                  </div>
                )}
                <span className="absolute top-2 left-2 inline-flex items-center px-2 py-0.5 rounded-full bg-black/50 text-[10px] text-white backdrop-blur-sm">
                  {it.kind}
                </span>
              </div>
              <div className="p-2.5 flex-1 flex flex-col">
                <div className="text-xs font-semibold text-text-1 line-clamp-2 leading-snug min-h-[2.2rem]">
                  {it.title}
                </div>
                <div className="mt-1 text-[10px] text-text-5 truncate">
                  {it.host}
                </div>
                <div className="mt-1 flex flex-col gap-0.5 text-[10px] text-text-6">
                  {it.period && (
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <CalendarClock size={10} className="shrink-0" />
                      <span className="truncate">{it.period}</span>
                    </span>
                  )}
                  {it.location && (
                    <span className="inline-flex items-center gap-1 min-w-0">
                      <MapPin size={10} className="shrink-0" />
                      <span className="truncate">{it.location}</span>
                    </span>
                  )}
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
