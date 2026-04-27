// 서버/클라이언트 모두에서 import 가능한 순수 포맷 유틸.
// period-picker / date-picker가 "use client"라 server component에서 import할 수 없어 분리.

const SEP = " – ";

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

function parse(value: string): { start: string; end: string } {
  if (!value) return { start: "", end: "" };
  if (value.includes(SEP)) {
    const [s, e] = value.split(SEP);
    return { start: (s ?? "").trim(), end: (e ?? "").trim() };
  }
  return { start: value.trim(), end: "" };
}

export function formatPeriod(value: string | null | undefined): string {
  if (!value) return "";
  const { start, end } = parse(value);
  const s = formatDate(start);
  const e = formatDate(end);
  if (s && e) return `${s}${SEP}${e}`;
  return s || e || "";
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

export function periodToColumns(
  value: string | null | undefined,
): PeriodColumns {
  if (!value)
    return {
      period_start: null,
      period_end: null,
      period_start_time: null,
      period_end_time: null,
    };
  const { start, end } = parse(value);
  const sp = splitPart(start);
  const ep = splitPart(end);
  return {
    period_start: sp.date,
    period_end: ep.date,
    period_start_time: sp.time,
    period_end_time: ep.time,
  };
}

export function periodFromColumns(c: Partial<PeriodColumns>): string {
  if (!c.period_start) return "";
  const trimTime = (t: string | null | undefined) => (t ? t.slice(0, 5) : null);
  const st = trimTime(c.period_start_time);
  const et = trimTime(c.period_end_time);
  const s = st ? `${c.period_start}T${st}` : c.period_start;
  if (!c.period_end) return s;
  const e = et ? `${c.period_end}T${et}` : c.period_end;
  return `${s}${SEP}${e}`;
}
