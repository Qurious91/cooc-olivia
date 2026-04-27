"use client";

import { useEffect, useState } from "react";
import Modal from "../../modal";

export type ApplyPayload = {
  message: string;
};

export default function ApplyModal({
  open,
  onClose,
  collabTitle,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  collabTitle: string;
  onSubmit: (payload: ApplyPayload) => Promise<void> | void;
}) {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setMessage("");
      setSubmitting(false);
    }
  }, [open]);

  const canSubmit = !submitting && message.trim().length > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await onSubmit({ message: message.trim() });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="참여 요청 보내기" size="md">
      <div className="flex flex-col h-full min-h-0">
        <p className="text-xs text-text-5 mb-1">
          &quot;{collabTitle}&quot; 게시자에게 보낼 메시지를 작성해주세요.
        </p>
        <p className="text-xs text-red-500 mb-4">
          한 번 보낸 요청은 취소할 수 없습니다.
        </p>

        <div className="flex-1 min-h-0">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="참여 의사를 전할 메시지를 작성해주세요."
            rows={6}
            className="w-full px-3 py-2.5 rounded-lg border border-border text-sm text-text-1 placeholder:text-text-6 focus:outline-none focus:border-[#999f54] bg-transparent resize-none"
          />
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 rounded-full text-sm text-text-3 hover:bg-black/5 dark:hover:bg-white/5 disabled:opacity-50"
          >
            취소
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-4 py-2 rounded-full bg-[#999f54] text-[#F2F0DC] text-sm font-semibold disabled:opacity-50"
          >
            {submitting ? "전송 중…" : "보내기"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
