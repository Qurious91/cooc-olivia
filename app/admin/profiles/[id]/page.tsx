import { ChevronLeft, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EditForm from "./edit-form";

export default async function ProfileDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select(
      "id, name, role, avatar_url, status, affiliation, job_title, region, keywords, is_admin, created_at, updated_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (!data) notFound();

  return (
    <main className="px-8 py-8">
      <Link
        href="/admin/profiles"
        className="inline-flex items-center gap-1 text-xs text-text-5 hover:text-text-3 mb-5"
      >
        <ChevronLeft size={14} />
        프로필 목록
      </Link>

      <div className="mb-6 flex items-center gap-4">
        <span className="shrink-0 w-16 h-16 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
          {data.avatar_url ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <User size={28} strokeWidth={1.75} />
          )}
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text-1 truncate">
            {data.name ?? <span className="text-text-6">(이름 없음)</span>}
          </h1>
          <p className="text-[11px] text-text-6 font-mono truncate">{data.id}</p>
          <p className="text-[11px] text-text-6">
            가입 {new Date(data.created_at).toLocaleString("ko-KR")} · 수정{" "}
            {new Date(data.updated_at).toLocaleString("ko-KR")}
          </p>
        </div>
      </div>

      <div className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-6">
        <EditForm
          initial={{
            id: data.id,
            name: data.name ?? "",
            role: data.role ?? "",
            affiliation: data.affiliation ?? "",
            job_title: data.job_title ?? "",
            region: data.region ?? "",
            status: data.status ?? "active",
            is_admin: data.is_admin,
            keywords: data.keywords ?? [],
          }}
        />
      </div>
    </main>
  );
}
