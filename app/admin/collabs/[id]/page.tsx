import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CollabForm, { type KindOption, type ProfileOption } from "../collab-form";

function toDateInput(value: string | null) {
  if (!value) return "";
  return value.slice(0, 10);
}

export default async function CollabDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [collabRes, profilesRes, kindsRes] = await Promise.all([
    supabase
      .from("collabs")
      .select(
        "id, author_id, kind, author, title, description, location, period_start, period_end, status, created_at, updated_at",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id, name, affiliation")
      .eq("is_admin", false)
      .order("name", { ascending: true }),
    supabase
      .from("collab_kinds")
      .select("key, label")
      .order("position", { ascending: true }),
  ]);

  const collab = collabRes.data;
  if (!collab) notFound();

  const profiles = (profilesRes.data ?? []) as ProfileOption[];
  const kinds = (kindsRes.data ?? []) as KindOption[];

  return (
    <main className="px-4 py-6 min-[1100px]:px-8 min-[1100px]:py-8">
      <Link
        href="/admin/collabs"
        className="inline-flex items-center gap-1 text-xs text-text-5 hover:text-text-3 mb-5"
      >
        <ChevronLeft size={14} />
        협업 목록
      </Link>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-text-1 truncate">{collab.title}</h1>
        <p className="text-[11px] text-text-6 font-mono truncate">{collab.id}</p>
        <p className="text-[11px] text-text-6">
          등록 {new Date(collab.created_at).toLocaleString("ko-KR")} · 수정{" "}
          {new Date(collab.updated_at).toLocaleString("ko-KR")}
        </p>
      </div>

      <div className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-6">
        <CollabForm
          mode="edit"
          id={collab.id}
          profiles={profiles}
          kinds={kinds}
          initial={{
            author_id: collab.author_id,
            kind: collab.kind,
            author: collab.author,
            title: collab.title,
            description: collab.description,
            location: collab.location ?? "",
            period_start: toDateInput(collab.period_start),
            period_end: toDateInput(collab.period_end),
            status: collab.status,
          }}
        />
      </div>
    </main>
  );
}
