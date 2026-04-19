"use client";

import { Check, ChevronDown } from "lucide-react";
import { useState } from "react";

type ChecklistItem = { id: string; label: string; done: boolean };

type Work = {
  id: string;
  title: string;
  partner: string;
  status: string;
  due: string;
  checklist: ChecklistItem[];
};

const INITIAL_WORKS: Work[] = [
  {
    id: "w1",
    title: "시즈널 디저트 코스 공동개발",
    partner: "이파티시에",
    status: "진행중",
    due: "2026-05-02",
    checklist: [
      { id: "c1", label: "컨셉/테마 확정", done: true },
      { id: "c2", label: "1차 레시피 개발", done: true },
      { id: "c3", label: "시식 및 피드백", done: true },
      { id: "c4", label: "원가 검토", done: false },
      { id: "c5", label: "최종 플레이팅 확정", done: false },
    ],
  },
  {
    id: "w2",
    title: "와인 페어링 시그니처 음료",
    partner: "최소믈리에",
    status: "리뷰",
    due: "2026-04-28",
    checklist: [
      { id: "c1", label: "페어링 방향성 논의", done: true },
      { id: "c2", label: "후보 와인 리스트업", done: true },
      { id: "c3", label: "블라인드 테이스팅", done: false },
      { id: "c4", label: "최종 페어링 확정", done: false },
    ],
  },
  {
    id: "w3",
    title: "팝업 다이닝 3일간 콜라보",
    partner: "한브랜드",
    status: "기획",
    due: "2026-06-10",
    checklist: [
      { id: "c1", label: "장소/일정 픽스", done: true },
      { id: "c2", label: "메뉴 구성 초안", done: false },
      { id: "c3", label: "예약 채널 오픈", done: false },
      { id: "c4", label: "홍보 컨텐츠 제작", done: false },
      { id: "c5", label: "운영 스태프 배치", done: false },
    ],
  },
  {
    id: "w4",
    title: "브런치 메뉴 신규 라인업",
    partner: "오베이커",
    status: "마감임박",
    due: "2026-04-20",
    checklist: [
      { id: "c1", label: "시즈널 재료 소싱", done: true },
      { id: "c2", label: "메뉴 5종 개발", done: true },
      { id: "c3", label: "사진 촬영", done: true },
      { id: "c4", label: "메뉴판 인쇄", done: true },
      { id: "c5", label: "오픈 전 리허설", done: false },
    ],
  },
];

export default function ActiveWorks() {
  const [works, setWorks] = useState<Work[]>(INITIAL_WORKS);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleItem = (workId: string, itemId: string) =>
    setWorks((prev) =>
      prev.map((w) =>
        w.id === workId
          ? {
              ...w,
              checklist: w.checklist.map((c) =>
                c.id === itemId ? { ...c, done: !c.done } : c,
              ),
            }
          : w,
      ),
    );

  return (
    <ul className="space-y-3">
      {works.map((w) => {
        const total = w.checklist.length;
        const done = w.checklist.filter((c) => c.done).length;
        const pct = total === 0 ? 0 : Math.round((done / total) * 100);
        const open = expanded.has(w.id);
        return (
          <li
            key={w.id}
            className="rounded-xl border border-black/10 bg-white shadow-sm p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] text-text-5 truncate">
                  with {w.partner}
                </div>
                <div className="mt-0.5 text-sm font-semibold text-text-1 truncate">
                  {w.title}
                </div>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-text-5">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-[#999f54]/15 text-[#4a4d22]">
                {w.status}
              </span>
              <span>마감 {w.due}</span>
              <span>
                {done}/{total} 완료
              </span>
              <button
                onClick={() => toggleExpand(w.id)}
                aria-expanded={open}
                aria-label={open ? "접기" : "자세히"}
                className="ml-auto inline-flex items-center gap-0.5 text-[#4a4d22]"
              >
                자세히
                <ChevronDown
                  size={12}
                  className={`transition-transform ${open ? "rotate-180" : ""}`}
                />
              </button>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-black/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#999f54] transition-[width]"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-[11px] text-text-6 w-9 text-right">{pct}%</span>
            </div>

            {open && (
              <div className="mt-3 pt-3 border-t border-black/5">
                <ul className="space-y-1.5">
                  {w.checklist.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => toggleItem(w.id, c.id)}
                        aria-pressed={c.done}
                        className="flex items-start gap-2 w-full text-left py-1 -my-1 rounded hover:bg-black/[0.02]"
                      >
                        <span
                          className={`mt-0.5 w-4 h-4 shrink-0 rounded border inline-flex items-center justify-center ${
                            c.done
                              ? "bg-[#999f54] border-[#999f54]"
                              : "border-black/20 bg-white"
                          }`}
                        >
                          {c.done && <Check size={12} className="text-[#F2F0DC]" />}
                        </span>
                        <span
                          className={`text-xs ${
                            c.done ? "text-text-6 line-through" : "text-text-4"
                          }`}
                        >
                          {c.label}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
