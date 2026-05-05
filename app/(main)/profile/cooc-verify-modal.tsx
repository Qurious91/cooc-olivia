"use client";

import { Paperclip, Upload, X } from "lucide-react";
import { useRef } from "react";

export type CoocFileSlot = {
  key: string;
  label: string;
};

export type CoocFilesState = Record<string, File | null>;

export function createCoocFilesState(slots: CoocFileSlot[]): CoocFilesState {
  return Object.fromEntries(slots.map((s) => [s.key, null]));
}

export function countCoocFiles(files: CoocFilesState): number {
  return Object.values(files).filter(Boolean).length;
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function FileSlot({
  label,
  file,
  onChange,
}: {
  label: string;
  file: File | null;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-lg border border-border p-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-text-2">{label}</span>
        <span className="text-[10px] font-semibold text-[#c0392b]">*필수</span>
      </div>

      {file ? (
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/[0.03] dark:bg-white/[0.04]">
          <Paperclip size={13} className="text-text-5 shrink-0" />
          <span className="flex-1 min-w-0">
            <span className="block text-[12px] text-text-2 truncate">
              {file.name}
            </span>
            <span className="block text-[10px] text-text-6">
              {formatBytes(file.size)}
            </span>
          </span>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="shrink-0 text-[11px] text-text-5 hover:text-text-3 underline-offset-2 hover:underline"
          >
            변경
          </button>
          <button
            type="button"
            onClick={() => onChange(null)}
            aria-label="제거"
            className="shrink-0 p-1 rounded text-text-5 hover:text-[#c0392b] hover:bg-black/5 dark:hover:bg-white/10"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-md border border-dashed border-black/15 dark:border-white/15 text-xs font-medium text-text-4 hover:border-[#999f54] hover:bg-[#999f54]/5"
        >
          <Upload size={13} />
          파일 선택 (PDF)
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        onChange={(e) => {
          const f = e.target.files?.[0] ?? null;
          if (f) onChange(f);
          e.target.value = "";
        }}
        className="sr-only"
      />
    </div>
  );
}

export default function CoocVerifyModal({
  open,
  onClose,
  slots,
  files,
  setFiles,
  note,
  setNote,
  title = "COOC 인증",
  subtitle = "관련 서류를 제출하면 운영팀이 직접 검토합니다",
  submitLabel = "제출하기",
  notePlaceholder = "운영팀이 알아두면 좋은 사항이 있다면 적어주세요",
  footerNote = "제출 후 영업일 기준 1~2일 내 검토 결과를 이메일로 안내드립니다.",
}: {
  open: boolean;
  onClose: () => void;
  slots: CoocFileSlot[];
  files: CoocFilesState;
  setFiles: React.Dispatch<React.SetStateAction<CoocFilesState>>;
  note: string;
  setNote: (note: string) => void;
  title?: string;
  subtitle?: string;
  submitLabel?: string;
  notePlaceholder?: string;
  footerNote?: string;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
    >
      <button
        type="button"
        aria-label="닫기"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />
      <div className="relative w-full sm:max-w-sm bg-background rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden max-h-[90dvh] flex flex-col">
        <div className="flex items-start gap-2.5 px-5 py-4 border-b border-black/5 dark:border-white/5">
          <span className="inline-flex items-center justify-center w-9 h-9 rounded-md bg-[#999f54] text-[#F2F0DC] text-[10px] font-bold tracking-wider">
            COOC
          </span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-text-1">{title}</p>
            <p className="text-[11px] text-text-5 mt-0.5">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-text-5"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-medium text-text-4 mb-2">
              서류 첨부 (PDF만 가능)
            </label>
            <div className="space-y-2">
              {slots.map((slot) => (
                <FileSlot
                  key={slot.key}
                  label={slot.label}
                  file={files[slot.key] ?? null}
                  onChange={(f) =>
                    setFiles((prev) => ({ ...prev, [slot.key]: f }))
                  }
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-4 mb-1.5">
              참고 메모 (선택)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] bg-transparent resize-none"
              placeholder={notePlaceholder}
            />
          </div>

          <p className="text-[11px] text-text-5 leading-relaxed">
            {footerNote}
          </p>
        </div>

        <div className="px-5 py-4 border-t border-black/5 dark:border-white/5 space-y-2">
          <button
            type="button"
            disabled
            title="준비중"
            className="w-full py-3 rounded-xl bg-[#999f54] text-[#F2F0DC] text-sm font-semibold opacity-40 cursor-not-allowed"
          >
            {submitLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-xs text-text-5 hover:text-text-3"
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
}
