"use client";

import { useState } from "react";
import DatePicker from "./date-picker";

export {
  formatDate,
  formatPeriod,
  periodFromColumns,
  periodToColumns,
  type PeriodColumns,
} from "./period-utils";

const SEP = " – ";

function parse(value: string): { start: string; end: string } {
  if (!value) return { start: "", end: "" };
  if (value.includes(SEP)) {
    const [s, e] = value.split(SEP);
    return { start: (s ?? "").trim(), end: (e ?? "").trim() };
  }
  return { start: value.trim(), end: "" };
}

type Props = {
  value: string;
  onChange: (v: string) => void;
};

export default function PeriodPicker({ value, onChange }: Props) {
  const initial = parse(value);
  const [start, setStart] = useState(initial.start);
  const [end, setEnd] = useState(initial.end);

  const emit = (s: string, e: string) => {
    if (s && e) onChange(`${s}${SEP}${e}`);
    else onChange(s || e || "");
  };

  const handleStart = (v: string) => {
    setStart(v);
    emit(v, end);
  };
  const handleEnd = (v: string) => {
    setEnd(v);
    emit(start, v);
  };

  const triggerStyle =
    "w-full px-3 py-2.5 rounded-lg border border-black/15 dark:border-white/15 text-base text-text-1 placeholder:text-text-6 focus:outline-none hover:border-[#999f54]/60 focus:border-[#999f54] transition-colors";

  return (
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
  );
}
