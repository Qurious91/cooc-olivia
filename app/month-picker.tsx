"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const DESKTOP_MQ = "(min-width: 1100px)";
const PANEL_WIDTH = 224;
const PANEL_HEIGHT = 220;
const GAP = 4;

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
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    placeAbove: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => {
      setMounted(true);
      setIsDesktop(mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (!open || !isDesktop) return;
    const updatePos = () => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const placeAbove =
        spaceBelow < PANEL_HEIGHT + GAP && rect.top > spaceBelow;
      const left = Math.max(
        8,
        Math.min(rect.left, window.innerWidth - PANEL_WIDTH - 8),
      );
      const top = placeAbove ? rect.top - GAP : rect.bottom + GAP;
      setPanelPos({ top, left, placeAbove });
    };
    updatePos();
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    return () => {
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open, isDesktop]);

  useEffect(() => {
    if (!open || isDesktop) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open, isDesktop]);

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

  const panelBody = (
    <>
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() =>
            setYear((y) => (view === "months" ? y - 1 : y - 12))
          }
          aria-label={view === "months" ? "이전 해" : "이전 12년"}
          className="w-8 h-8 rounded-full text-text-5 hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center justify-center"
        >
          <ChevronLeft size={14} />
        </button>
        <button
          type="button"
          onClick={() => setView((v) => (v === "months" ? "years" : "months"))}
          className="text-sm font-semibold text-text-1 tabular-nums px-3 py-1 rounded-md hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
        >
          {view === "months" ? year : `${yearStart}-${yearStart + 11}`}
        </button>
        <button
          type="button"
          onClick={() =>
            setYear((y) => (view === "months" ? y + 1 : y + 12))
          }
          aria-label={view === "months" ? "다음 해" : "다음 12년"}
          className="w-8 h-8 rounded-full text-text-5 hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center justify-center"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      {view === "months" ? (
        <div className="grid grid-cols-3 gap-1">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => {
            const isSelected = selectedYear === year && selectedMonth === m;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  onChange(`${year}-${String(m).padStart(2, "0")}`);
                  setOpen(false);
                }}
                className={`${
                  isDesktop ? "py-1.5 text-xs" : "py-3 text-sm"
                } rounded-md tabular-nums transition-colors ${
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
                className={`${
                  isDesktop ? "py-1.5 text-xs" : "py-3 text-sm"
                } rounded-md tabular-nums transition-colors ${
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
          className={`mt-2 w-full ${
            isDesktop ? "py-1.5 text-[11px]" : "py-3 text-xs"
          } text-text-5 hover:text-red-500`}
        >
          비우기
        </button>
      )}
    </>
  );

  const desktopPanel = open && isDesktop && panelPos && (
    <div
      ref={panelRef}
      className="fixed z-[70] rounded-xl bg-surface border border-black/10 dark:border-white/10 shadow-lg p-3"
      style={{
        top: panelPos.top,
        left: panelPos.left,
        width: PANEL_WIDTH,
        transform: panelPos.placeAbove ? "translateY(-100%)" : undefined,
      }}
    >
      {panelBody}
    </div>
  );

  const mobilePanel = open && !isDesktop && (
    <div
      className="fixed inset-0 z-[70] bg-black/40 flex items-end"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) setOpen(false);
      }}
    >
      <div
        ref={panelRef}
        className="w-full bg-surface rounded-t-2xl p-4 pb-8 shadow-2xl"
      >
        {panelBody}
      </div>
    </div>
  );

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? setOpen(false) : openPicker())}
        className={`${triggerClassName ?? defaultTrigger} text-xs tabular-nums text-left w-full ${
          value ? "text-text-1" : "text-text-6"
        }`}
      >
        {value ? formatYm(value) : emptyLabel}
      </button>
      {mounted &&
        createPortal(
          <>
            {desktopPanel}
            {mobilePanel}
          </>,
          document.body,
        )}
    </div>
  );
}
