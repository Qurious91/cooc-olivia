"use client";

import { CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";

type CompletedWork = {
  id: string;
  title: string;
  partner: string;
  completedAt: string;
  outcome?: string;
  desc: string;
};

const COMPLETED_WORKS: CompletedWork[] = [
  {
    id: "cw1",
    title: "겨울 시즌 디저트 3종 개발",
    partner: "이파티시에",
    completedAt: "2026-02-14",
    outcome: "매장 정규 메뉴 2종 편입",
    desc:
      "겨울 시즌 한정 디저트 3종을 공동 개발. 시식회 3회와 원가 조정을 거쳐, 2종이 다음 시즌 정규 메뉴로 편입되었습니다.",
  },
  {
    id: "cw2",
    title: "로컬 와이너리 컬래버 디너",
    partner: "정소믈리에",
    completedAt: "2025-12-03",
    outcome: "2회 연속 전석 매진",
    desc:
      "국내 와이너리 4곳과 연계한 페어링 디너. 총 2회 진행, 양일 모두 전석 매진으로 와이너리 측 후속 제안을 받았습니다.",
  },
  {
    id: "cw3",
    title: "플랜트베이스 런치 팝업",
    partner: "한브랜드",
    completedAt: "2025-10-19",
    desc:
      "한브랜드 플래그십 스토어에서 3일간 운영한 비건 런치 팝업. 일일 예약 40석 기준으로 대기자 명단까지 모두 소화했습니다.",
  },
];

export default function CompletedWorks() {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const partners = new Set(COMPLETED_WORKS.map((w) => w.partner));

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

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
          {COMPLETED_WORKS.map((cw) => {
            const isOpen = expanded.has(cw.id);
            return (
              <li
                key={cw.id}
                className="rounded-xl border border-black/10 bg-[#999f54]/[0.04] p-3.5"
              >
                <div className="text-[11px] text-text-5">with {cw.partner}</div>
                <div className="mt-0.5 text-sm font-semibold text-text-3">
                  {cw.title}
                </div>
                {cw.outcome && (
                  <p className="mt-1 text-[11px] text-text-5 leading-relaxed">
                    {cw.outcome}
                  </p>
                )}
                <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-text-6">
                  <span>완료 {cw.completedAt}</span>
                  <button
                    type="button"
                    onClick={() => toggleExpand(cw.id)}
                    aria-expanded={isOpen}
                    aria-label={isOpen ? "접기" : "자세히"}
                    className="inline-flex items-center gap-0.5 text-[11px] text-[#4a4d22]"
                  >
                    자세히
                    <ChevronDown
                      size={12}
                      className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                </div>
                {isOpen && cw.desc && (
                  <p className="mt-3 pt-3 border-t border-black/5 text-xs text-text-4 whitespace-pre-wrap leading-relaxed">
                    {cw.desc}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
