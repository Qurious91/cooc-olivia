import { FileText } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  formatDateTime,
  STATUS_COLORS,
  STATUS_LABEL,
  STATUS_ORDER,
  type VerificationStatus,
} from "./mock-data";
import VerificationRow from "./row";

type SubmissionRow = {
  id: string;
  status: VerificationStatus;
  created_at: string;
  profiles: { email: string | null } | null;
  verification_files: { id: string }[] | null;
};

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("verification_submissions")
    .select(
      `id, status, created_at,
       profiles!verification_submissions_user_id_fkey(email),
       verification_files(id)`,
    )
    .order("created_at", { ascending: false })
    .limit(200);

  const rows = ((data ?? []) as unknown as SubmissionRow[]).slice().sort((a, b) => {
    const s = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
    if (s !== 0) return s;
    return b.created_at.localeCompare(a.created_at);
  });

  const pendingCount = rows.filter((r) => r.status === "pending").length;

  return (
    <main className="px-4 py-6 min-[1100px]:px-8 min-[1100px]:py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-text-1">인증</h1>
          <p className="mt-0.5 text-xs text-text-5">
            총 {rows.length}건
            {pendingCount > 0 && (
              <>
                {" · "}
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  검토 대기 {pendingCount}건
                </span>
              </>
            )}
          </p>
        </div>
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
                <th className="text-left font-medium px-4 py-2.5">이메일</th>
                <th className="text-left font-medium px-4 py-2.5">파일</th>
                <th className="text-left font-medium px-4 py-2.5">상태</th>
                <th className="text-left font-medium px-4 py-2.5 max-[1099px]:hidden">제출일</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5 dark:divide-white/5">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-sm text-text-6"
                  >
                    인증 요청이 없어요
                  </td>
                </tr>
              ) : (
                rows.map((s) => (
                  <VerificationRow key={s.id} id={s.id}>
                    <td className="px-4 py-3 text-text-1">
                      {s.profiles?.email ?? (
                        <span className="text-text-6">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-text-3">
                      <span className="inline-flex items-center gap-1.5 text-[12px]">
                        <FileText size={13} className="text-text-5" />
                        {s.verification_files?.length ?? 0}건
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] border ${STATUS_COLORS[s.status]}`}
                      >
                        {STATUS_LABEL[s.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-text-5 text-xs whitespace-nowrap max-[1099px]:hidden">
                      {formatDateTime(s.created_at)}
                    </td>
                  </VerificationRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
