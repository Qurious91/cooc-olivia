"use client";

import { AlertCircle, Check, ClipboardPaste, Copy } from "lucide-react";
import { useState, type ReactNode } from "react";

const INPUT =
  "w-full px-3 py-2 rounded-lg border border-border bg-surface text-sm text-text-1 placeholder:text-text-6 outline-none focus:border-[#999f54]";

export default function JsonFillPanel({
  prompt,
  template,
  onApply,
  note,
  children,
}: {
  prompt: string;
  template: string;
  onApply: (parsed: Record<string, unknown>) => void;
  note?: string;
  children?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyPrompt = async () => {
    setErr(null);
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(prompt);
      } else {
        const ta = document.createElement("textarea");
        ta.value = prompt;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setErr("클립보드 복사에 실패했어요.");
    }
  };

  const apply = () => {
    setErr(null);
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "JSON 파싱에 실패했어요.");
      return;
    }
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      setErr("객체 형태의 JSON이 필요해요.");
      return;
    }
    onApply(parsed as Record<string, unknown>);
    setText("");
    setOpen(false);
  };

  return (
    <div className="rounded-lg border border-dashed border-black/10 dark:border-white/10 bg-black/[0.015] dark:bg-white/[0.02]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs text-text-4 hover:text-text-1"
      >
        <span className="inline-flex items-center gap-1.5">
          <ClipboardPaste size={13} />
          JSON 붙여넣기로 한 번에 채우기
        </span>
        <span className="text-text-6">{open ? "닫기" : "열기"}</span>
      </button>
      {open && (
        <div className="px-3 pb-3 space-y-2">
          <div className="rounded-md border border-black/5 dark:border-white/10 bg-background">
            {note && (
              <div className="px-2.5 py-1.5 border-b border-black/5 dark:border-white/10">
                <span className="text-[12px] text-text-5">{note}</span>
              </div>
            )}
            {children && (
              <div className="border-b border-black/5 dark:border-white/10">{children}</div>
            )}
            <div className="px-2.5 py-2 border-b border-black/5 dark:border-white/10 space-y-1.5">
              <p className="text-[12px] text-text-5 leading-relaxed">
                프롬프트를 복사해 생성형 AI(ChatGPT·Claude 등)에 붙여넣고 원하는 주제를 적으면 JSON이 만들어져요. 결과를 아래 입력칸에 붙여넣고 [채우기]를 누르세요.
              </p>
              <button
                type="button"
                onClick={copyPrompt}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] border transition-colors ${
                  copied
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                    : "bg-surface border-black/5 dark:border-white/10 text-text-4 hover:text-text-1 hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                {copied ? <Check size={11} /> : <Copy size={11} />}
                {copied ? "복사됨" : "프롬프트 복사"}
              </button>
            </div>
            <pre className="px-2.5 py-2 text-[11px] leading-relaxed text-text-3 whitespace-pre-wrap font-mono">
              {prompt}
            </pre>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={template}
            rows={10}
            className={`${INPUT} font-mono text-[11px] leading-relaxed resize-none`}
          />
          {err && (
            <div className="flex items-start gap-2 px-2.5 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[11px] text-red-600 dark:text-red-400">
              <AlertCircle size={12} className="mt-0.5 shrink-0" />
              <span>{err}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={apply}
              disabled={!text.trim()}
              className="px-2.5 py-1.5 rounded-md bg-[#999f54] text-[#F2F0DC] text-[11px] font-semibold hover:opacity-90 disabled:opacity-50"
            >
              채우기
            </button>
            <button
              type="button"
              onClick={() => {
                setText("");
                setErr(null);
              }}
              className="px-2.5 py-1.5 rounded-md text-[11px] text-text-4 hover:bg-black/5 dark:hover:bg-white/5"
            >
              비우기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
