"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const DESKTOP_MQ = "(min-width: 1100px)";
const PANEL_HEIGHT = 360;
const PANEL_WIDTH = 256;
const GAP = 4;
const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTE_STEP = 5;
const MINUTES = Array.from(
  { length: 60 / MINUTE_STEP },
  (_, i) => i * MINUTE_STEP,
);

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "";
  const [datePart, timePart] = value.split("T");
  const parts = datePart.split("-");
  if (parts.length < 2) return value;
  const [y, m, d] = parts;
  const dateStr = d ? `${y}.${m}.${d}` : `${y}.${m}`;
  if (timePart) return `${dateStr} ${timePart}`;
  return dateStr;
}

type Parsed = {
  y: number;
  mo: number;
  d: number;
  hasTime: boolean;
  hour: number;
  minute: number;
};

function parseValue(value: string): Parsed | null {
  if (!value) return null;
  const [datePart, timePart] = value.split("T");
  const parts = datePart.split("-");
  if (parts.length !== 3) return null;
  const y = parseInt(parts[0], 10);
  const mo = parseInt(parts[1], 10);
  const d = parseInt(parts[2], 10);
  if (isNaN(y) || isNaN(mo) || isNaN(d)) return null;
  let hour = 0;
  let minute = 0;
  let hasTime = false;
  if (timePart) {
    const [hh, mm] = timePart.split(":");
    const h = parseInt(hh, 10);
    const m = parseInt(mm, 10);
    if (!isNaN(h) && !isNaN(m)) {
      hour = h;
      minute = m;
      hasTime = true;
    }
  }
  return { y, mo, d, hour, minute, hasTime };
}

function serialize(
  y: number,
  mo: number,
  d: number,
  hasTime: boolean,
  hour: number,
  minute: number,
) {
  const date = `${y}-${pad(mo)}-${pad(d)}`;
  if (hasTime) return `${date}T${pad(hour)}:${pad(minute)}`;
  return date;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
  emptyLabel?: string;
  allowClear?: boolean;
  allowTime?: boolean;
  triggerClassName?: string;
};

export default function DatePicker({
  value,
  onChange,
  emptyLabel = "----.--.--",
  allowClear = false,
  allowTime = true,
  triggerClassName,
}: Props) {
  const parsed = parseValue(value);
  const now = new Date();
  const [open, setOpen] = useState(false);
  const [year, setYear] = useState(parsed?.y ?? now.getFullYear());
  const [month, setMonth] = useState(parsed?.mo ?? now.getMonth() + 1);
  const [wantsTime, setWantsTime] = useState(parsed?.hasTime ?? false);
  const [timeOpen, setTimeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const [panelPos, setPanelPos] = useState<{
    top: number;
    left: number;
    placeAbove: boolean;
  } | null>(null);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const timeWrapRef = useRef<HTMLDivElement>(null);
  const hourColRef = useRef<HTMLDivElement>(null);
  const minuteColRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const clearAndClose = () => {
    onChangeRef.current("");
    setOpen(false);
  };
  const confirmAndClose = () => setOpen(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => setIsDesktop(mq.matches);
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
      onChangeRef.current("");
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

  useEffect(() => {
    if (!timeOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (timeWrapRef.current?.contains(e.target as Node)) return;
      setTimeOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [timeOpen]);

  useEffect(() => {
    if (!timeOpen) return;
    const scrollToSelected = (el: HTMLDivElement | null) => {
      if (!el) return;
      const sel = el.querySelector<HTMLElement>("[data-selected='true']");
      if (!sel) return;
      el.scrollTop =
        sel.offsetTop - el.clientHeight / 2 + sel.clientHeight / 2;
    };
    requestAnimationFrame(() => {
      scrollToSelected(hourColRef.current);
      scrollToSelected(minuteColRef.current);
    });
  }, [timeOpen]);

  useEffect(() => {
    if (!wantsTime) setTimeOpen(false);
  }, [wantsTime]);

  const openPicker = () => {
    if (parsed) {
      setYear(parsed.y);
      setMonth(parsed.mo);
      setWantsTime(parsed.hasTime);
    } else {
      setYear(now.getFullYear());
      setMonth(now.getMonth() + 1);
    }
    setOpen(true);
  };

  const firstDow = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrev = new Date(year, month - 1, 0).getDate();

  const cells: { day: number; current: boolean; y: number; mo: number }[] = [];
  for (let i = firstDow - 1; i >= 0; i--) {
    const prevY = month === 1 ? year - 1 : year;
    const prevM = month === 1 ? 12 : month - 1;
    cells.push({ day: daysInPrev - i, current: false, y: prevY, mo: prevM });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, current: true, y: year, mo: month });
  }
  while (cells.length < 42) {
    const i = cells.length - firstDow - daysInMonth + 1;
    const nextY = month === 12 ? year + 1 : year;
    const nextM = month === 12 ? 1 : month + 1;
    cells.push({ day: i, current: false, y: nextY, mo: nextM });
  }

  const navMonth = (delta: number) => {
    let nm = month + delta;
    let ny = year;
    while (nm < 1) {
      nm += 12;
      ny -= 1;
    }
    while (nm > 12) {
      nm -= 12;
      ny += 1;
    }
    setYear(ny);
    setMonth(nm);
  };

  const hour = parsed?.hour ?? 0;
  const minute = parsed?.minute ?? 0;

  const pickDay = (y: number, mo: number, d: number) => {
    onChange(serialize(y, mo, d, wantsTime, hour, minute));
    if (y !== year || mo !== month) {
      setYear(y);
      setMonth(mo);
    }
    if (!wantsTime) setOpen(false);
  };

  const toggleMode = (enabled: boolean) => {
    setWantsTime(enabled);
    if (parsed) {
      onChange(serialize(parsed.y, parsed.mo, parsed.d, enabled, hour, minute));
    }
  };

  const updateTime = (h: number, m: number) => {
    if (!parsed) return;
    onChange(serialize(parsed.y, parsed.mo, parsed.d, true, h, m));
  };

  const defaultTrigger =
    "bg-transparent border-b border-dashed border-[#999f54]/35 rounded-none outline-none pb-px transition-colors hover:border-[#999f54]/70 focus:border-solid focus:border-[#999f54]";

  const display = value ? formatDate(value) : emptyLabel;

  const panelBody = (
    <>
      {allowTime && (
        <div className="flex items-center justify-center mb-2">
          <div className="inline-flex rounded-full border border-black/15 dark:border-white/15 p-0.5">
            <button
              type="button"
              onClick={() => toggleMode(false)}
              className={`px-3 py-0.5 rounded-full text-[11px] transition-colors ${
                !wantsTime
                  ? "bg-[#999f54] text-[#F2F0DC]"
                  : "text-text-5 hover:text-text-2"
              }`}
            >
              날짜만
            </button>
            <button
              type="button"
              onClick={() => toggleMode(true)}
              className={`px-3 py-0.5 rounded-full text-[11px] transition-colors ${
                wantsTime
                  ? "bg-[#999f54] text-[#F2F0DC]"
                  : "text-text-5 hover:text-text-2"
              }`}
            >
              시간까지
            </button>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between mb-2">
        <button
          type="button"
          onClick={() => navMonth(-1)}
          aria-label="이전 달"
          className="w-7 h-7 rounded-full text-text-5 hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center justify-center"
        >
          <ChevronLeft size={14} />
        </button>
        <div className="text-sm font-semibold text-text-1 tabular-nums">
          {year}.{pad(month)}
        </div>
        <button
          type="button"
          onClick={() => navMonth(1)}
          aria-label="다음 달"
          className="w-7 h-7 rounded-full text-text-5 hover:bg-black/5 dark:hover:bg-white/5 inline-flex items-center justify-center"
        >
          <ChevronRight size={14} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 mb-0.5">
        {WEEKDAYS.map((w, i) => (
          <div
            key={w}
            className={`text-center text-[10px] py-1 ${
              i === 0 ? "text-red-400" : i === 6 ? "text-blue-400" : "text-text-6"
            }`}
          >
            {w}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5">
        {cells.map((c, i) => {
          const isSelected =
            c.current &&
            parsed?.y === c.y &&
            parsed?.mo === c.mo &&
            parsed?.d === c.day;
          const dow = i % 7;
          const currentColor =
            dow === 0
              ? "text-red-500"
              : dow === 6
              ? "text-blue-500"
              : "text-text-2";
          return (
            <button
              key={i}
              type="button"
              onClick={() => pickDay(c.y, c.mo, c.day)}
              className={`h-9 rounded-md text-[12px] tabular-nums transition-colors ${
                isSelected
                  ? "bg-[#999f54] text-[#F2F0DC]"
                  : c.current
                  ? `${currentColor} hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25`
                  : "text-text-6/40 hover:bg-black/5 dark:hover:bg-white/5"
              }`}
            >
              {c.day}
            </button>
          );
        })}
      </div>
      {allowTime && wantsTime && (
        <div
          ref={timeWrapRef}
          className="mt-3 relative rounded-lg bg-black/[0.03] dark:bg-white/[0.04]"
        >
          <button
            type="button"
            disabled={!parsed}
            onClick={() => setTimeOpen((v) => !v)}
            className={`w-full flex items-center justify-center gap-2.5 px-3 py-2 rounded-lg transition-colors ${
              !parsed
                ? "opacity-50 cursor-not-allowed"
                : timeOpen
                ? "bg-[#999f54]/15"
                : "hover:bg-black/5 dark:hover:bg-white/5"
            }`}
          >
            <span className="text-[11px] text-text-5">시간</span>
            <span
              className={`text-sm tabular-nums font-medium ${
                parsed ? "text-text-1" : "text-text-5"
              }`}
            >
              {pad(hour)}:{pad(minute)}
            </span>
          </button>
          {timeOpen && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 z-10 rounded-lg bg-surface border border-black/10 dark:border-white/10 shadow-lg p-1 flex">
              <div
                ref={hourColRef}
                className="w-14 max-h-40 overflow-y-auto scroll-smooth"
              >
                {HOURS.map((h) => {
                  const sel = h === hour;
                  return (
                    <button
                      key={h}
                      type="button"
                      data-selected={sel}
                      onClick={() => updateTime(h, minute)}
                      className={`block w-full py-1 rounded text-xs tabular-nums transition-colors ${
                        sel
                          ? "bg-[#999f54] text-[#F2F0DC]"
                          : "text-text-2 hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
                      }`}
                    >
                      {pad(h)}
                    </button>
                  );
                })}
              </div>
              <div className="w-px bg-black/10 dark:bg-white/10 mx-0.5" />
              <div
                ref={minuteColRef}
                className="w-14 max-h-40 overflow-y-auto scroll-smooth"
              >
                {MINUTES.map((m) => {
                  const sel = m === minute;
                  return (
                    <button
                      key={m}
                      type="button"
                      data-selected={sel}
                      onClick={() => updateTime(hour, m)}
                      className={`block w-full py-1 rounded text-xs tabular-nums transition-colors ${
                        sel
                          ? "bg-[#999f54] text-[#F2F0DC]"
                          : "text-text-2 hover:bg-[#999f54]/15 dark:hover:bg-[#999f54]/25"
                      }`}
                    >
                      {pad(m)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
      <div className="mt-3 pt-2 border-t border-black/5 dark:border-white/5 flex items-center gap-2">
        {allowClear && (
          <button
            type="button"
            onClick={clearAndClose}
            className="flex-1 py-1.5 rounded-md text-[11px] text-text-5 hover:text-red-500 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            비우기
          </button>
        )}
        <button
          type="button"
          onClick={confirmAndClose}
          className="flex-[2] py-1.5 rounded-md text-[12px] font-semibold bg-[#999f54] text-[#F2F0DC] hover:opacity-90 transition-opacity"
        >
          완료
        </button>
      </div>
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
        if (e.target === e.currentTarget) clearAndClose();
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
        {display}
      </button>
      {mounted && createPortal(
        <>
          {desktopPanel}
          {mobilePanel}
        </>,
        document.body,
      )}
    </div>
  );
}
