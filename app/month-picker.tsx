"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function formatYm(ym: string | null | undefined) {
  if (!ym) return "";
  const [y, m] = ym.split("-");
  return `${y}.${m}`;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  emptyLabel?: string;
  allowClear?: boolean;
  triggerClassName?: string;
};

export default function MonthPicker({
  value,
  onChange,
  emptyLabel = "----.--",
  allowClear = false,
  triggerClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"months" | "years">("months");
  const [year, setYear] = useState(() => {
    if (value) {
      const y = parseInt(value.split("-")[0], 10);
      if (!isNaN(y)) return y;
    }
    return new Date().getFullYear();
  });
  const ref = useRef<HTMLDivElement>(null);
  const stop = (e: React.PointerEvent) => e.stopPropagation();

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const selectedYear = value ? parseInt(value.split("-")[0], 10) : null;
  const selectedMonth = value ? parseInt(value.split("-")[1], 10) : null;

  const openPicker = () => {
    if (value) {
      const y = parseInt(value.split("-")[0], 10);
      if (!isNaN(y)) setYear(y);
    } else {
      setYear(new Date().getFullYear());
    }
    setView("months");
    setOpen(true);
  };

  const yearStart = year - (((year % 12) + 12) % 12);
  const yearList = Array.from({ length: 12 }, (_, i) => yearStart + i);

  const defaultTrigger =
    "bg-transparent border-b border-dashed border-[#999f54]/35 rounded-none outline-none pb-px transition-colors hover:border-[#999f54]/70 focus:border-solid focus:border-[#999f54]";

  return (
    <div ref={ref} className="relative" onPointerDown={stop}>
      <button
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={`${triggerClassName ?? defaultTrigger} text-xs tabular-nums text-left w-full ${
          value ? "text-text-1" : "text-text-6"
        }`}
      >
        {value ? formatYm(value) : emptyLabel}
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-56 rounded-xl bg-surface border border-black/10 dark:border-white/10 shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              type="button"
              onClick={() =>
                setYear((y) => (view === "months" ? y - 1 : y - 12))
              }
              aria-label={view === "months" ? "이전 해" : "이전 12년"}
              className="w-7 h-7 rounded-full text-text-5 hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center justify-center"
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={() =>
                setView((v) => (v === "months" ? "years" : "months"))
              }
              className="text-sm font-semibold text-text-1 tabular-nums px-2 py-0.5 rounded-md hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
            >
              {view === "months"
                ? year
                : `${yearStart}-${yearStart + 11}`}
            </button>
            <button
              type="button"
              onClick={() =>
                setYear((y) => (view === "months" ? y + 1 : y + 12))
              }
              aria-label={view === "months" ? "다음 해" : "다음 12년"}
              className="w-7 h-7 rounded-full text-text-5 hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center justify-center"
            >
              <ChevronRight size={14} />
            </button>
          </div>
          {view === "months" ? (
            <div className="grid grid-cols-3 gap-1">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
                const isSelected =
                  selectedYear === year && selectedMonth === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      onChange(`${year}-${String(m).padStart(2, "0")}`);
                      setOpen(false);
                    }}
                    className={`py-1.5 rounded-md text-xs tabular-nums transition-colors ${
                      isSelected
                        ? "bg-[#999f54] text-[#F2F0DC]"
                        : "text-text-2 hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
                    }`}
                  >
                    {m}월
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1">
              {yearList.map((y) => {
                const isSelected = selectedYear === y;
                return (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setYear(y);
                      setView("months");
                    }}
                    className={`py-1.5 rounded-md text-xs tabular-nums transition-colors ${
                      isSelected
                        ? "bg-[#999f54] text-[#F2F0DC]"
                        : "text-text-2 hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
                    }`}
                  >
                    {y}
                  </button>
                );
              })}
            </div>
          )}
          {allowClear && value && (
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className="mt-2 w-full py-1.5 text-[11px] text-text-5 hover:text-red-500"
            >
              비우기
            </button>
          )}
        </div>
      )}
    </div>
  );
}
