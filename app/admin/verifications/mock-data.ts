// 인증 요청 화면 공용 상수 (status 라벨 / 색상)
// 파일명은 mock-data로 시작했지만 현재는 타입·표기 상수만 보관.

export type VerificationStatus = "pending" | "approved" | "rejected";

export const STATUS_LABEL: Record<VerificationStatus, string> = {
  pending: "검토 대기",
  approved: "승인",
  rejected: "반려",
};

export const STATUS_COLORS: Record<VerificationStatus, string> = {
  pending:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  approved:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  rejected:
    "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
};

export const STATUS_ORDER: Record<VerificationStatus, number> = {
  pending: 0,
  approved: 1,
  rejected: 2,
};

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const date = `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  return `${date} ${time}`;
}

export function formatBytes(n: number | null | undefined) {
  if (n == null) return "—";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}
