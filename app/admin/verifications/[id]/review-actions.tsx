"use client";

import { Check, X } from "lucide-react";
import { useState } from "react";

export default function ReviewActions({ id: _id }: { id: string }) {
  const [reviewNote, setReviewNote] = useState("");

  return (
    <section className="rounded-xl bg-surface border border-black/5 dark:border-white/5 p-5">
      <h2 className="text-xs font-semibold text-text-5 uppercase tracking-wide mb-3">
        검토
      </h2>
      <label className="block text-xs font-medium text-text-4 mb-1.5">
        검토 메모 (선택 · 반려 시 사용자에게 전달)
      </label>
      <textarea
        value={reviewNote}
        onChange={(e) => setReviewNote(e.target.value)}
        rows={3}
        placeholder="승인 사유나 반려 시 안내 문구를 적어주세요"
        className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] bg-transparent resize-none mb-3"
      />
      <div className="flex gap-2">
        <button
          type="button"
          disabled
          title="준비중 (Server Action 연결 후 활성화)"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-emerald-600 text-white text-sm font-semibold opacity-40 cursor-not-allowed"
        >
          <Check size={14} />
          승인
        </button>
        <button
          type="button"
          disabled
          title="준비중 (Server Action 연결 후 활성화)"
          className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-red-600 text-white text-sm font-semibold opacity-40 cursor-not-allowed"
        >
          <X size={14} />
          반려
        </button>
      </div>
    </section>
  );
}
