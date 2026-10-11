"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

interface TimeValue {
  hour: string;
  minute: string;
  period: "AM" | "PM";
}

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);
const MINUTES = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, "0"),
);

function parseTimeString(value: string): { start: TimeValue; end: TimeValue } {
  const defaultTime: TimeValue = { hour: "09", minute: "00", period: "AM" };
  const defaultEnd: TimeValue = { hour: "05", minute: "00", period: "PM" };

  if (!value)
    return { start: { ...defaultTime }, end: { ...defaultEnd } };

  const parts = value.split(" - ");
  if (parts.length !== 2)
    return { start: { ...defaultTime }, end: { ...defaultEnd } };

  const parse = (str: string): TimeValue => {
    const match = str.trim().match(/^(\d{1,2}):(\d{2})(AM|PM)$/i);
    if (!match) return { ...defaultTime };
    return {
      hour: String(parseInt(match[1])).padStart(2, "0"),
      minute: match[2],
      period: match[3].toUpperCase() as "AM" | "PM",
    };
  };

  return { start: parse(parts[0]), end: parse(parts[1]) };
}

function formatTime(t: TimeValue): string {
  return `${parseInt(t.hour)}:${t.minute}${t.period}`;
}

interface TimeRangePickerProps {
  value: string;
  onChange: (val: string) => void;
  className?: string;
}

export function TimeRangePicker({
  value,
  onChange,
  className = "",
}: TimeRangePickerProps) {
  const parsed = parseTimeString(value);
  const [start, setStart] = useState<TimeValue>(parsed.start);
  const [end, setEnd] = useState<TimeValue>(parsed.end);

  // Sync external value → local state (e.g. when initialData loads)
  useEffect(() => {
    const p = parseTimeString(value);
    setStart(p.start);
    setEnd(p.end);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const emit = (s: TimeValue, e: TimeValue) => {
    onChange(`${formatTime(s)} - ${formatTime(e)}`);
  };

  const updateStart = (patch: Partial<TimeValue>) => {
    const next = { ...start, ...patch };
    setStart(next);
    emit(next, end);
  };

  const updateEnd = (patch: Partial<TimeValue>) => {
    const next = { ...end, ...patch };
    setEnd(next);
    emit(start, next);
  };

  const selectCls =
    "h-9 rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-2 text-sm text-gray-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 transition-all cursor-pointer [&>option]:bg-white [&>option]:dark:bg-slate-900 [&>option]:text-gray-900 [&>option]:dark:text-slate-100";

  return (
    <div className={`flex items-center gap-2 flex-wrap ${className}`}>
      <Clock size={14} className="text-gray-400 shrink-0" />

      {/* Start time */}
      <div className="flex items-center gap-1">
        <select
          value={start.hour}
          onChange={(e) => updateStart({ hour: e.target.value })}
          className={selectCls}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {parseInt(h)}
            </option>
          ))}
        </select>
        <span className="text-gray-400 text-sm font-bold">:</span>
        <select
          value={start.minute}
          onChange={(e) => updateStart({ minute: e.target.value })}
          className={selectCls}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={start.period}
          onChange={(e) =>
            updateStart({ period: e.target.value as "AM" | "PM" })
          }
          className={selectCls}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>

      <span className="text-gray-400 text-xs font-semibold">—</span>

      {/* End time */}
      <div className="flex items-center gap-1">
        <select
          value={end.hour}
          onChange={(e) => updateEnd({ hour: e.target.value })}
          className={selectCls}
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>
              {parseInt(h)}
            </option>
          ))}
        </select>
        <span className="text-gray-400 text-sm font-bold">:</span>
        <select
          value={end.minute}
          onChange={(e) => updateEnd({ minute: e.target.value })}
          className={selectCls}
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <select
          value={end.period}
          onChange={(e) =>
            updateEnd({ period: e.target.value as "AM" | "PM" })
          }
          className={selectCls}
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </div>
  );
}
