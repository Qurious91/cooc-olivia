import { notFound } from "next/navigation";
import { formatPeriod, periodFromColumns } from "../../../../period-utils";
import { createClient } from "@/lib/supabase/server";
import PhotoDetail, {
  type PhotoDetailItem,
  type PhotoDetailParticipant,
} from "../../../../_components/photo-detail";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collabs")
    .select(
      "id, title, description, period_start, period_end, period_start_time, period_end_time, location, " +
        "collab_kinds(label), " +
        "profiles!collabs_author_id_fkey(id, name, nickname), " +
        "collab_photos(image_url, position)",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !data) notFound();

  const c = data as any;
  const p = c.profiles ?? null;
  const host = p?.nickname?.trim() || p?.name?.trim() || "익명";
  const photos = (c.collab_photos ?? []) as Array<{
    image_url: string;
    position: number;
  }>;
  const images = photos
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((x) => x.image_url);

  const { data: parts } = await supabase
    .from("collab_applications")
    .select(
      "profiles!collab_applications_applicant_id_fkey(id, nickname, name, avatar_url)",
    )
    .eq("collab_id", c.id)
    .eq("status", "accepted");
  const participants: PhotoDetailParticipant[] = ((parts ?? []) as any[])
    .map((r) => {
      const pp = r.profiles;
      if (!pp) return null;
      return {
        id: pp.id,
        nickname: pp.nickname?.trim() || pp.name?.trim() || "익명",
        avatarUrl: pp.avatar_url ?? null,
      };
    })
    .filter((x): x is PhotoDetailParticipant => x !== null);

  const item: PhotoDetailItem = {
    id: c.id,
    kind: c.collab_kinds?.label ?? "",
    title: c.title,
    host,
    hostId: p?.id ?? null,
    period: formatPeriod(
      periodFromColumns({
        period_start: c.period_start,
        period_end: c.period_end,
        period_start_time: c.period_start_time,
        period_end_time: c.period_end_time,
      }),
    ),
    location: c.location ?? "",
    desc: c.description ?? "",
    images,
    participants,
  };

  return (
    <div className="min-h-[100dvh] flex flex-col items-center">
      <div className="w-full max-w-2xl bg-surface border-x border-black/10 dark:border-white/10 flex-1 flex flex-col">
        <PhotoDetail item={item} backHref="/collabs/desktop" />
      </div>
    </div>
  );
}
