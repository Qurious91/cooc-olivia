"use client";

import { AlertCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import JsonFillPanel from "../_components/json-fill-panel";
import {
  createCollab,
  deleteCollab,
  updateCollab,
  type CollabInput,
} from "./actions";

const STATUS_OPTIONS = ["recruiting", "in_progress", "done", "cancelled"] as const;
const AUTHOR_OPTIONS = ["이름", "소속", "둘 다"] as const;
const INPUT_KEYS: (keyof CollabInput)[] = [
  "kind",
  "author",
  "title",
  "description",
  "location",
  "period_start",
  "period_end",
  "status",
];
const DATE_KEYS = new Set<keyof CollabInput>(["period_start", "period_end"]);

const JSON_TEMPLATE = `{
  "title": "",
  "kind": "",
  "author": "이름",
  "description": "",
  "location": "",
  "period_start": "",
  "period_end": "",
  "status": "recruiting"
}`;

const AI_PROMPT = `아래 스키마에 맞춰 협업(collab) 데이터를 JSON으로만 생성해줘. 코드블록/설명 없이 순수 JSON만.

- title (string, 필수): 협업 제목
- kind (string, 필수): guest | test | develop | popup | consult 중 하나
- author (string): "이름" | "소속" | "둘 다" 중 하나 (노출 방식, 기본 "이름")
- description (string, 필수): 협업 설명
- location (string): 장소 (예: "서울 성수"), 없으면 ""
- period_start, period_end (string): "YYYY-MM-DD" 형식, 없으면 ""
- status (string): recruiting | in_progress | done | cancelled (기본 recruiting)

주제:`;

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-1 placeholder:text-text-6 outline-none focus:border-[#999f54]";

export type ProfileOption = { id: string; name: string | null; affiliation: string | null };
export type KindOption = { key: string; label: string };

export default function CollabForm({
  mode,
  id,
  initial,
  profiles,
  kinds,
}: {
  mode: "create" | "edit";
  id?: string;
  initial: CollabInput;
  profiles: ProfileOption[];
  kinds: KindOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [form, setForm] = useState<CollabInput>(initial);

  const set = <K extends keyof CollabInput>(k: K, v: CollabInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const applyJson = (src: Record<string, unknown>) => {
    setForm((f) => {
      const next = { ...f };
      for (const k of INPUT_KEYS) {
        if (!(k in src)) continue;
        const raw = src[k];
        if (raw == null) {
          next[k] = "";
          continue;
        }
        if (typeof raw !== "string") continue;
        next[k] = DATE_KEYS.has(k) ? raw.slice(0, 10) : raw;
      }
      return next;
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.author_id) {
      setError("작성자를 선택해주세요.");
      return;
    }
    startTransition(async () => {
      try {
        if (mode === "create") {
          const res = await createCollab(form);
          if (res.error) setError(res.error);
          else router.push("/admin/collabs");
        } else if (id) {
          const res = await updateCollab(id, form);
          if (res.error) setError(res.error);
          else router.push("/admin/collabs");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "알 수 없는 오류가 발생했어요.");
      }
    });
  };

  const onDelete = () => {
    if (!id) return;
    if (!confirm("정말 이 협업을 삭제할까요? 이 작업은 되돌릴 수 없어요.")) return;
    setError(null);
    setDeleting(true);
    startTransition(async () => {
      const res = await deleteCollab(id);
      if (res?.error) {
        setError(res.error);
        setDeleting(false);
      }
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field label="작성자" required>
        <select
          value={form.author_id}
          onChange={(e) => set("author_id", e.target.value)}
          required
          className={INPUT}
        >
          <option value="">선택</option>
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name ?? "(이름 없음)"}
              {p.affiliation ? ` · ${p.affiliation}` : ""}
            </option>
          ))}
        </select>
      </Field>

      <JsonFillPanel
        prompt={AI_PROMPT}
        template={JSON_TEMPLATE}
        onApply={applyJson}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="제목">
          <input
            type="text"
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            required
            className={INPUT}
          />
        </Field>
        <Field label="종류">
          <select
            value={form.kind}
            onChange={(e) => set("kind", e.target.value)}
            required
            className={INPUT}
          >
            <option value="">선택</option>
            {kinds.map((k) => (
              <option key={k.key} value={k.key}>
                {k.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="노출 방식">
          <select
            value={form.author}
            onChange={(e) => set("author", e.target.value)}
            className={INPUT}
          >
            {AUTHOR_OPTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
        <Field label="장소">
          <input
            type="text"
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="예: 서울 성수"
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
        <Field label="기간 시작">
          <input
            type="date"
            value={form.period_start}
            onChange={(e) => set("period_start", e.target.value)}
            className={INPUT}
          />
        </Field>
        <Field label="기간 종료">
          <input
            type="date"
            value={form.period_end}
            onChange={(e) => set("period_end", e.target.value)}
            className={INPUT}
          />
        </Field>
      </div>

      <Field label="설명">
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
          rows={6}
          className={`${INPUT} resize-none`}
        />
      </Field>

      {error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-black/5 dark:border-white/5">
        {mode === "edit" ? (
          <button
            type="button"
            onClick={onDelete}
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 disabled:opacity-50"
          >
            <Trash2 size={14} />
            {deleting ? "삭제 중..." : "삭제"}
          </button>
        ) : (
          <span />
        )}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/admin/collabs")}
            className="px-4 py-2 rounded-lg text-sm text-text-3 hover:bg-black/5 dark:hover:bg-white/5"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={pending || !form.author_id}
            title={!form.author_id ? "작성자를 선택하세요" : undefined}
            className="px-4 py-2 rounded-lg bg-[#999f54] text-[#F2F0DC] text-sm font-semibold hover:opacity-90 disabled:opacity-50"
          >
            {pending && !deleting ? "저장 중..." : mode === "create" ? "생성" : "저장"}
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
