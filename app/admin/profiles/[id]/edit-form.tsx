"use client";

import { AlertCircle, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import JsonFillPanel from "../../_components/json-fill-panel";
import { deleteProfile, updateProfile, type UpdateProfileInput } from "./actions";

const STATUS_OPTIONS = ["active", "suspended", "pending"] as const;

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-1 placeholder:text-text-6 outline-none focus:border-[#999f54]";

type StringKey = "name" | "role" | "affiliation" | "job_title" | "region" | "status";
const STRING_KEYS: StringKey[] = [
  "name",
  "role",
  "affiliation",
  "job_title",
  "region",
  "status",
];

const JSON_TEMPLATE = `{
  "name": "",
  "role": "",
  "affiliation": "",
  "job_title": "",
  "region": "",
  "status": "active",
  "keywords": []
}`;

const AI_PROMPT = `아래 스키마에 맞춰 프로필 데이터를 JSON으로만 생성해줘. 코드블록/설명 없이 순수 JSON만.

- name (string): 이름
- role (string): 역할 (예: "creator", "brand")
- affiliation (string): 소속 (브랜드/스튜디오 이름)
- job_title (string): 포지션/직함
- region (string): 활동 지역 (예: "서울 성수")
- status (string): active | suspended | pending (기본 active)
- keywords (string[]): 관심사/태그 문자열 배열 (# 없이)

없는 값은 빈 문자열 "" 또는 빈 배열 [] 로.

주제:`;

export default function EditForm({ initial }: { initial: UpdateProfileInput }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<UpdateProfileInput>(initial);
  const [keywordDraft, setKeywordDraft] = useState("");

  const set = <K extends keyof UpdateProfileInput>(k: K, v: UpdateProfileInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const applyJson = (src: Record<string, unknown>) => {
    setForm((f) => {
      const next = { ...f };
      for (const k of STRING_KEYS) {
        if (!(k in src)) continue;
        const raw = src[k];
        if (raw == null) {
          next[k] = "";
        } else if (typeof raw === "string") {
          next[k] = raw;
        }
      }
      if ("keywords" in src) {
        const raw = src.keywords;
        if (Array.isArray(raw)) {
          next.keywords = raw
            .filter((v): v is string => typeof v === "string")
            .map((v) => v.replace(/^#/, "").trim())
            .filter(Boolean);
        }
      }
      return next;
    });
  };

  const addKeyword = () => {
    const v = keywordDraft.replace(/^#/, "").trim();
    if (!v || form.keywords.includes(v)) {
      setKeywordDraft("");
      return;
    }
    set("keywords", [...form.keywords, v]);
    setKeywordDraft("");
  };

  const missingRequired =
    !form.name?.trim() || !form.role?.trim() || !form.affiliation?.trim();

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (missingRequired) {
      setError("이름, 역할, 소속을 모두 입력해주세요.");
      return;
    }
    startTransition(async () => {
      const res = await updateProfile(form);
      if (res.error) setError(res.error);
      else router.push("/admin/profiles");
    });
  };

  const onDelete = () => {
    if (!confirm("정말 이 프로필을 삭제할까요? 이 작업은 되돌릴 수 없어요.")) return;
    setError(null);
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteProfile(form.id);
      if (res?.error) {
        setError(res.error);
        setDeleting(false);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <JsonFillPanel
        prompt={AI_PROMPT}
        template={JSON_TEMPLATE}
        onApply={applyJson}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="이메일">
          <input
            type="email"
            value={form.email}
            readOnly
            disabled
            title="이메일은 auth.users와 동기화되며 직접 수정할 수 없어요."
            className={`${INPUT} bg-black/[0.03] dark:bg-white/[0.03] cursor-not-allowed text-text-5`}
          />
        </Field>
        <Field label="이름" required>
          <input
            type="text"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            required
            className={INPUT}
          />
        </Field>
        <Field label="역할" required>
          <input
            type="text"
            value={form.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="예: creator, brand"
            required
            className={INPUT}
          />
        </Field>
        <Field label="소속" required>
          <input
            type="text"
            value={form.affiliation}
            onChange={(e) => set("affiliation", e.target.value)}
            required
            className={INPUT}
          />
        </Field>
        <Field label="포지션">
          <input
            type="text"
            value={form.job_title}
            onChange={(e) => set("job_title", e.target.value)}
            className={INPUT}
          />
        </Field>
        <Field label="지역">
          <input
            type="text"
            value={form.region}
            onChange={(e) => set("region", e.target.value)}
            className={INPUT}
          />
        </Field>
        <Field label="상태">
          <select
            value={form.status}
            onChange={(e) => set("status", e.target.value)}
            className={INPUT}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field label="키워드">
        <div className="flex flex-wrap items-center gap-1.5 px-2 py-2 rounded-lg border border-border bg-surface">
          {form.keywords.map((k) => (
            <span
              key={k}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#999f54]/15 dark:bg-[#999f54]/25 text-[#4a4d22] dark:text-[#d4d8a8] text-sm"
            >
              {k}
              <button
                type="button"
                onClick={() =>
                  set(
                    "keywords",
                    form.keywords.filter((x) => x !== k),
                  )
                }
                aria-label={`${k} 제거`}
                className="text-[#4a4d22]/70 dark:text-[#d4d8a8]/70 hover:text-[#4a4d22] dark:hover:text-[#d4d8a8]"
              >
                <X size={12} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={keywordDraft}
            onChange={(e) => setKeywordDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addKeyword();
              } else if (
                e.key === "Backspace" &&
                keywordDraft === "" &&
                form.keywords.length > 0
              ) {
                set("keywords", form.keywords.slice(0, -1));
              }
            }}
            placeholder={form.keywords.length === 0 ? "Enter 로 추가" : "+ 추가"}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text-1 placeholder:text-text-6 px-1"
          />
        </div>
      </Field>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
        <button
          type="button"
          onClick={onDelete}
          disabled={pending}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
        >
          <Trash2 size={14} />
          {deleting ? "삭제 중..." : "삭제"}
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/profiles")}
            className="px-4 py-2 rounded-lg text-sm text-text-3 hover:bg-black/5 dark:hover:bg-white/5"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={pending || missingRequired}
            title={missingRequired ? "이름, 역할, 소속을 입력하세요" : undefined}
            className="px-4 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {pending && !deleting ? "저장 중..." : "저장"}
          </button>
        </div>
      </div>
    </form>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-text-4 mb-1.5">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </span>
      {children}
    </label>
  );
}
