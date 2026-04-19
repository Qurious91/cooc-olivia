"use client";

import { CheckCircle2, ChevronDown, Sparkles } from "lucide-react";
import { useState } from "react";

type CompletedWork = {
  id: string;
  title: string;
  partner: string;
  completedAt: string;
  outcome?: string;
};

const COMPLETED_WORKS: CompletedWork[] = [
  {
    id: "cw1",
    title: "겨울 시즌 디저트 3종 개발",
    partner: "이파티시에",
    completedAt: "2026-02-14",
    outcome: "매장 정규 메뉴 2종 편입",
  },
  {
    id: "cw2",
    title: "로컬 와이너리 컬래버 디너",
    partner: "정소믈리에",
    completedAt: "2025-12-03",
    outcome: "2회 연속 전석 매진",
  },
  {
    id: "cw3",
    title: "플랜트베이스 런치 팝업",
    partner: "한브랜드",
    completedAt: "2025-10-19",
  },
];

export default function CompletedWorks() {
  const [open, setOpen] = useState(false);
  const partners = new Set(COMPLETED_WORKS.map((w) => w.partner));

  return (
    <div className="mt-8 pt-4 border-t border-black/10">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <div className="min-w-0">
          <h3 className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-1">
            <CheckCircle2 size={14} className="text-[#999f54]" />
            마무리한 프로젝트
            <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22]">
              with COOC
            </span>
          </h3>
          <p className="mt-0.5 text-[11px] text-text-6">
            완료 {COMPLETED_WORKS.length}건 · 파트너 {partners.size}명
          </p>
        </div>
        <ChevronDown
          size={18}
          className={`shrink-0 text-text-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <ul className="mt-3 space-y-2.5">
          {COMPLETED_WORKS.map((cw) => (
            <li
              key={cw.id}
              className="rounded-xl border border-black/10 bg-[#999f54]/[0.04] p-3.5"
            >
              <div className="text-[11px] text-text-5 flex items-center gap-1.5 flex-wrap">
                with {cw.partner}
                <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22]">
                  <Sparkles size={10} />
                  with COOC
                </span>
              </div>
              <div className="mt-0.5 text-sm font-semibold text-text-3">
                {cw.title}
              </div>
              {cw.outcome && (
                <p className="mt-1 text-[11px] text-text-5 leading-relaxed">
                  {cw.outcome}
                </p>
              )}
              <div className="mt-2 text-[11px] text-text-6">완료 {cw.completedAt}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
