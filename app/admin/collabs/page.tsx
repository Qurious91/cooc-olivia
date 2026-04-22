import { Plus } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CollabRow from "./row";

type CollabListRow = {
  id: string;
  title: string;
  status: string;
  kind: string;
  created_at: string;
  author_id: string;
  collab_kinds: { label: string } | null;
  profiles: { name: string | null } | null;
};

const STATUS_COLORS: Record<string, string> = {
  recruiting: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  in_progress: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  done: "bg-black/5 text-text-5 border-black/10 dark:bg-white/5 dark:text-text-5 dark:border-white/10",
  cancelled: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AdminCollabsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collabs")
    .select(
      "id, title, status, kind, created_at, author_id, collab_kinds(label), profiles!collabs_author_id_fkey(name)",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  const rows = (data ?? []) as unknown as CollabListRow[];

  return (
    <main className="px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-1">협업</h1>
          <p className="mt-0.5 text-xs text-text-5">총 {rows.length}건 (최근 100건)</p>
        </div>
        <Link
          href="/admin/collabs/new"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90"
        >
          <Plus size={14} />
          새 협업
        </Link>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
          조회 중 오류가 발생했어요: {error.message}
        </div>
      )}

      <div className="rounded-xl bg-surface border border-black/5 dark:border-white/5 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black/[0.02] dark:bg-white/[0.02] text-text-5 text-xs">
              <tr>
                <th className="text-left font-medium px-4 py-2.5">제목</th>
                <th className="text-left font-medium px-4 py-2.5">작성자</th>
                <th className="text-left font-medium px-4 py-2.5">종류</th>
                <th className="text-left font-medium px-4 py-2.5">상태</th>
                <th className="text-left font-medium px-4 py-2.5">등록일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-text-6">
                    협업이 없어요
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <CollabRow key={c.id} id={c.id}>
                    <td className="px-4 py-3 text-text-1">{c.title}</td>
                    <td className="px-4 py-3 text-text-3">
                      {c.profiles?.name || <span className="text-text-6">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-3">
                      {c.collab_kinds?.label || c.kind}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${
                          STATUS_COLORS[c.status] ?? "bg-black/5 text-text-5 border-black/10"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-5 text-xs whitespace-nowrap">
                      {formatDate(c.created_at)}
                    </td>
                  </CollabRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
