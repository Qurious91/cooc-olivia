import { User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProfileRow from "./row";

type ProfileRow = {
  id: string;
  name: string | null;
  role: string | null;
  avatar_url: string | null;
  status: string | null;
  affiliation: string | null;
  job_title: string | null;
  region: string | null;
  is_admin: boolean;
  created_at: string;
};

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  suspended: "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
  pending: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

export default async function AdminProfilesPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, name, role, avatar_url, status, affiliation, job_title, region, is_admin, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);
  const rows = (data ?? []) as ProfileRow[];

  return (
    <main className="px-4 py-6 min-[1100px]:px-8 min-[1100px]:py-8">
      <div className="mb-8">
        <h1 className="text-xl font-bold text-text-1">프로필</h1>
        <p className="mt-0.5 text-xs text-text-5">총 {rows.length}명 (최근 100명)</p>
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
                <th className="text-left font-medium px-4 py-2.5">사용자</th>
                <th className="text-left font-medium px-4 py-2.5 max-[1099px]:hidden">역할</th>
                <th className="text-left font-medium px-4 py-2.5">소속</th>
                <th className="text-left font-medium px-4 py-2.5 max-[1099px]:hidden">지역</th>
                <th className="text-left font-medium px-4 py-2.5">상태</th>
                <th className="text-left font-medium px-4 py-2.5 max-[1099px]:hidden">권한</th>
                <th className="text-left font-medium px-4 py-2.5 max-[1099px]:hidden">가입일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-text-6">
                    프로필이 없어요
                  </td>
                </tr>
              ) : (
                rows.map((p) => (
                  <ProfileRow key={p.id} id={p.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="shrink-0 w-9 h-9 rounded-full bg-[#999f54] text-[#F2F0DC] inline-flex items-center justify-center overflow-hidden">
                          {p.avatar_url ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={p.avatar_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <User size={16} strokeWidth={1.75} />
                          )}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm text-text-1 truncate">
                            {p.name ?? <span className="text-text-6">(이름 없음)</span>}
                          </div>
                          <div className="text-[11px] text-text-6 truncate font-mono">
                            {p.id.slice(0, 8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-text-3 max-[1099px]:hidden">
                      {[p.role, p.job_title].filter(Boolean).join(" · ") || (
                        <span className="text-text-6">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-3">
                      {p.affiliation || <span className="text-text-6">—</span>}
                    </td>
                    <td className="px-4 py-3 text-text-3 max-[1099px]:hidden">
                      {p.region || <span className="text-text-6">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {p.status ? (
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${
                            STATUS_COLORS[p.status] ?? "bg-black/5 text-text-5 border-black/10"
                          }`}
                        >
                          {p.status}
                        </span>
                      ) : (
                        <span className="text-text-6">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-[1099px]:hidden">
                      {p.is_admin ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] border border-[#999f54]/25">
                          admin
                        </span>
                      ) : (
                        <span className="text-text-6">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-5 text-xs whitespace-nowrap max-[1099px]:hidden">
                      {formatDate(p.created_at)}
                    </td>
                  </ProfileRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
