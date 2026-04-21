"use client";

import { useState } from "react";
import DatePicker, { formatDate } from "./date-picker";

const SEP = " – ";

type Mode = "single" | "range";

function parse(value: string): { mode: Mode; start: string; end: string } {
  if (!value) return { mode: "single", start: "", end: "" };
  if (value.includes(SEP)) {
    const [s, e] = value.split(SEP);
    return { mode: "range", start: (s ?? "").trim(), end: (e ?? "").trim() };
  }
  return { mode: "single", start: value.trim(), end: "" };
}

export function formatPeriod(value: string | null | undefined): string {
  if (!value) return "";
  const { mode, start, end } = parse(value);
  if (mode === "range") {
    const s = formatDate(start);
    const e = formatDate(end);
    if (s && e) return `${s}${SEP}${e}`;
    return s || e || "";
  }
  return formatDate(start);
}

export type PeriodColumns = {
  period_start: string | null;
  period_end: string | null;
  period_start_time: string | null;
  period_end_time: string | null;
};

function splitPart(s: string): { date: string | null; time: string | null } {
  if (!s) return { date: null, time: null };
  const [d, t] = s.split("T");
  return { date: d || null, time: t || null };
}

export function periodToColumns(value: string | null | undefined): PeriodColumns {
  if (!value)
    return {
      period_start: null,
      period_end: null,
      period_start_time: null,
      period_end_time: null,
    };
  const { mode, start, end } = parse(value);
  const sp = splitPart(start);
  const ep = mode === "range" ? splitPart(end) : { date: null, time: null };
  return {
    period_start: sp.date,
    period_end: ep.date,
    period_start_time: sp.time,
    period_end_time: ep.time,
  };
}

export function periodFromColumns(c: Partial<PeriodColumns>): string {
  if (!c.period_start) return "";
  const trimTime = (t: string | null | undefined) =>
    t ? t.slice(0, 5) : null;
  const st = trimTime(c.period_start_time);
  const et = trimTime(c.period_end_time);
  const s = st ? `${c.period_start}T${st}` : c.period_start;
  if (!c.period_end) return s;
  const e = et ? `${c.period_end}T${et}` : c.period_end;
  return `${s}${SEP}${e}`;
}

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function PeriodPicker({ value, onChange }: Props) {
  const initial = parse(value);
  const [mode, setMode] = useState<Mode>(initial.mode);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);

  const emit = (m: Mode, s: string, e: string) => {
    if (m === "single") onChange(s);
    else if (s && e) onChange(`${s}${SEP}${e}`);
    else onChange(s || e || "");
  };

  const handleMode = (m: Mode) => {
    setMode(m);
    emit(m, start, end);
  };
  const handleStart = (v: string) => {
    setStart(v);
    emit(mode, v, end);
  };
  const handleEnd = (v: string) => {
    setEnd(v);
    emit(mode, start, v);
  };

  const triggerStyle =
    "w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-text-1 placeholder:text-text-6 focus:outline-none hover:border-[#999f54]/60 focus:border-[#999f54] transition-colors";

  return (
    <div className="flex flex-col gap-2">
      <div className="inline-flex rounded-full border border-black/15 dark:border-white/15 p-0.5 self-start">
        <button
          type="button"
          onClick={() => handleMode("single")}
          className={`px-3 py-0.5 rounded-full text-[11px] transition-colors ${
            mode === "single"
              ? "bg-[#999f54] text-[#F2F0DC]"
              : "text-text-5 hover:text-text-2"
          }`}
        >
          하루
        </button>
        <button
          type="button"
          onClick={() => handleMode("range")}
          className={`px-3 py-0.5 rounded-full text-[11px] transition-colors ${
            mode === "range"
              ? "bg-[#999f54] text-[#F2F0DC]"
              : "text-text-5 hover:text-text-2"
          }`}
        >
          기간
        </button>
      </div>
      {mode === "single" ? (
        <DatePicker
          value={start}
          onChange={handleStart}
          emptyLabel="날짜 선택"
          allowClear
          triggerClassName={triggerStyle}
        />
      ) : (
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <DatePicker
              value={start}
              onChange={handleStart}
              emptyLabel="시작"
              allowClear
              triggerClassName={triggerStyle}
            />
          </div>
          <span className="text-text-6 text-sm shrink-0">–</span>
          <div className="flex-1 min-w-0">
            <DatePicker
              value={end}
              onChange={handleEnd}
              emptyLabel="종료"
              allowClear
              triggerClassName={triggerStyle}
            />
          </div>
        </div>
      )}
    </div>
  );
}
