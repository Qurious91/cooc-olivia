import { notFound } from "next/navigation";
import { ARCHIVE_DUMMY } from "../data";
import { formatPeriod, periodFromColumns } from "../../../period-utils";
import { createClient } from "@/lib/supabase/server";
import ArchiveDetailContent, {
  type ArchiveDetailItem,
  type ArchiveParticipant,
} from "./content";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // 1) 더미부터 매칭
  const dummy = ARCHIVE_DUMMY.find((d) => d.id === id);
  if (dummy) {
    const item: ArchiveDetailItem = {
      id: dummy.id,
      kind: dummy.kind,
      title: dummy.title,
      host: dummy.host,
      hostId: null,
      period: dummy.period,
      location: dummy.location,
      desc: dummy.desc,
      images: [dummy.image],
      participants: [],
    };
    return <ArchiveDetailContent item={item} />;
  }

  // 2) DB의 공개된 collab으로 매칭 (archive_published_at IS NOT NULL)
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collabs")
    .select(
      "id, title, description, period_start, period_end, period_start_time, period_end_time, location, archive_published_at, " +
        "collab_kinds(label), " +
        "profiles!collabs_author_id_fkey(id, name, nickname), " +
        "collab_photos(image_url, position)",
    )
    .eq("id", id)
    .eq("status", "done")
    .not("archive_published_at", "is", null)
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

  // 참여자 (accepted 신청자)
  const { data: parts } = await supabase
    .from("collab_applications")
    .select(
      "profiles!collab_applications_applicant_id_fkey(id, nickname, name, avatar_url)",
    )
    .eq("collab_id", c.id)
    .eq("status", "accepted");
  const participants: ArchiveParticipant[] = ((parts ?? []) as any[])
    .map((r) => {
      const pp = r.profiles;
      if (!pp) return null;
      return {
        id: pp.id,
        nickname: pp.nickname?.trim() || pp.name?.trim() || "익명",
        avatarUrl: pp.avatar_url ?? null,
      };
    })
    .filter((x): x is ArchiveParticipant => x !== null);

  const item: ArchiveDetailItem = {
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

  return <ArchiveDetailContent item={item} />;
}
