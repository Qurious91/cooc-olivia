import { ChevronLeft, Download, FileText } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  formatBytes,
  formatDateTime,
  STATUS_COLORS,
  STATUS_LABEL,
  type VerificationStatus,
} from "../mock-data";
import ReviewActions from "./review-actions";

type SubmissionDetail = {
  id: string;
  user_id: string;
  note: string | null;
  status: VerificationStatus;
  reviewed_at: string | null;
  review_note: string | null;
  created_at: string;
  updated_at: string;
  profiles: { email: string | null } | null;
};

type FileRow = {
  id: string;
  path: string;
  filename: string;
  size_bytes: number | null;
  created_at: string;
};

const SIGNED_URL_TTL_SECONDS = 600;

export default async function AdminVerificationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: submissionRaw } = await supabase
    .from("verification_submissions")
    .select(
      `id, user_id, note, status, reviewed_at, review_note, created_at, updated_at,
       profiles!verification_submissions_user_id_fkey(email)`,
    )
    .eq("id", id)
    .maybeSingle();

  if (!submissionRaw) notFound();
  const submission = submissionRaw as unknown as SubmissionDetail;

  const { data: filesRaw } = await supabase
    .from("verification_files")
    .select("id, path, filename, size_bytes, created_at")
    .eq("submission_id", id)
    .order("created_at", { ascending: true });
  const files = (filesRaw ?? []) as FileRow[];

  const filesWithUrls = await Promise.all(
    files.map(async (f) => {
      const { data: signed } = await supabase.storage
        .from("verifications")
        .createSignedUrl(f.path, SIGNED_URL_TTL_SECONDS, { download: true });
      return { ...f, signedUrl: signed?.signedUrl ?? null };
    }),
  );

  return (
    <main className="px-4 py-6 min-[1100px]:px-8 min-[1100px]:py-8 max-w-3xl">
      <Link
        href="/admin/verifications"
        className="inline-flex items-center gap-1 text-xs text-text-5 hover:text-text-3 mb-5"
      >
        <ChevronLeft size={14} />
        인증 목록
      </Link>

      <div className="mb-6 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-text-1">인증 요청</h1>
          <p className="text-[11px] text-text-6 font-mono truncate">
            {submission.id}
          </p>
          <p className="text-[11px] text-text-6 mt-0.5">
            제출 {formatDateTime(submission.created_at)}
            {submission.updated_at !== submission.created_at && (
              <> · 수정 {formatDateTime(submission.updated_at)}</>
            )}
          </p>
        </div>
        <span
          className={`shrink-0 inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${STATUS_COLORS[submission.status]}`}
        >
          {STATUS_LABEL[submission.status]}
        </span>
      </div>

      <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-5 mb-4">
        <h2 className="text-xs font-semibold text-text-5 uppercase tracking-wide mb-2">
          제출자
        </h2>
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm text-text-1 truncate">
            {submission.profiles?.email ?? (
              <span className="text-text-6">이메일 없음</span>
            )}
          </div>
          <Link
            href={`/admin/profiles/${submission.user_id}`}
            className="shrink-0 text-[11px] text-text-5 hover:text-text-3"
          >
            프로필 →
          </Link>
        </div>
      </section>

      {submission.note && (
        <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-5 mb-4">
          <h2 className="text-xs font-semibold text-text-5 uppercase tracking-wide mb-2">
            제출자 메모
          </h2>
          <p className="text-sm text-text-2 whitespace-pre-wrap leading-relaxed">
            {submission.note}
          </p>
        </section>
      )}

      <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-5 mb-4">
        <h2 className="text-xs font-semibold text-text-5 uppercase tracking-wide mb-3">
          첨부 파일 ({filesWithUrls.length})
        </h2>
        {filesWithUrls.length === 0 ? (
          <p className="text-sm text-text-6">첨부 파일이 없어요</p>
        ) : (
          <ul className="divide-y divide-black/5 dark:divide-white/10">
            {filesWithUrls.map((f) => (
              <li
                key={f.id}
                className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0"
              >
                <span className="shrink-0 w-8 h-8 rounded-md bg-black/5 dark:bg-white/10 inline-flex items-center justify-center text-text-4">
                  <FileText size={15} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-text-1 truncate">
                    {f.filename}
                  </div>
                  <div className="text-[11px] text-text-6">
                    {formatBytes(f.size_bytes)} · {formatDateTime(f.created_at)}
                  </div>
                </div>
                {f.signedUrl ? (
                  <a
                    href={f.signedUrl}
                    rel="noopener noreferrer"
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-text-3 border border-border hover:bg-black/[0.03] dark:hover:bg-white/[0.04]"
                  >
                    <Download size={12} />
                    다운로드
                  </a>
                ) : (
                  <span className="shrink-0 text-[11px] text-text-6">URL 생성 실패</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-[10px] text-text-6">
          다운로드 링크는 {Math.round(SIGNED_URL_TTL_SECONDS / 60)}분 동안 유효합니다.
        </p>
      </section>

      {submission.status !== "pending" && (
        <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-5 mb-4">
          <h2 className="text-xs font-semibold text-text-5 uppercase tracking-wide mb-2">
            검토 결과
          </h2>
          <div className="text-[11px] text-text-6 mb-2">
            {submission.reviewed_at && formatDateTime(submission.reviewed_at)}
          </div>
          {submission.review_note ? (
            <p className="text-sm text-text-2 whitespace-pre-wrap leading-relaxed">
              {submission.review_note}
            </p>
          ) : (
            <p className="text-sm text-text-6">검토 메모 없음</p>
          )}
        </section>
      )}

      {submission.status === "pending" && <ReviewActions id={submission.id} />}
    </main>
  );
}
