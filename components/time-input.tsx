"use client";

import { useRef, useState, useEffect } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";

function roundTo15(minutes: number): number {
  return Math.round(minutes / 15) * 15;
}

function clamp(val: number, min: number, max: number) {
  return Math.max(min, Math.min(max, val));
}

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fromMinutes(total: number): string {
  const clamped = clamp(total, 0, 23 * 60 + 45);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

interface Props {
  value: string; // "HH:MM" or ""
  onChange: (val: string) => void;
  placeholder?: string;
  className?: string;
  min?: string; // "06:00"
  max?: string; // "23:00"
}

export function TimeInput({ value, onChange, placeholder = "HH:MM", className = "", min = "06:00", max = "23:00" }: Props) {
  const [display, setDisplay] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const minMin = toMinutes(min);
  const maxMin = toMinutes(max);

  useEffect(() => {
    setDisplay(value);
  }, [value]);

  function commit(raw: string) {
    // Parse typed input and round to 15 min
    const cleaned = raw.replace(/[^\d:]/g, "");
    let h = 0, m = 0;

    if (cleaned.includes(":")) {
      const parts = cleaned.split(":");
      h = parseInt(parts[0]) || 0;
      m = parseInt(parts[1]) || 0;
    } else if (cleaned.length <= 2) {
      h = parseInt(cleaned) || 0;
      m = 0;
    } else {
      // e.g. "830" → 8:30, "1430" → 14:30
      h = parseInt(cleaned.slice(0, -2)) || 0;
      m = parseInt(cleaned.slice(-2)) || 0;
    }

    h = clamp(h, 0, 23);
    m = roundTo15(m);
    if (m >= 60) { m = 0; h = Math.min(h + 1, 23); }

    const total = clamp(h * 60 + m, minMin, maxMin);
    const result = fromMinutes(total);
    setDisplay(result);
    onChange(result);
  }

  function step(delta: number) {
    const current = value ? toMinutes(value) : toMinutes(min);
    const next = clamp(current + delta * 15, minMin, maxMin);
    const result = fromMinutes(next);
    setDisplay(result);
    onChange(result);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowUp") { e.preventDefault(); step(1); }
    if (e.key === "ArrowDown") { e.preventDefault(); step(-1); }
    if (e.key === "Enter") { commit(display); }
  }

  return (
    <div className={`relative flex items-center ${className}`}>
      <input
        ref={inputRef}
        type="text"
        inputMode="numeric"
        value={display}
        placeholder={placeholder}
        onChange={e => setDisplay(e.target.value)}
        onBlur={() => { if (display) commit(display); }}
        onKeyDown={handleKeyDown}
        className="w-full pr-7 px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 tabular-nums"
      />
      <div className="absolute right-1 flex flex-col">
        <button type="button" tabIndex={-1} onClick={() => step(1)}
          className="p-0 text-gray-400 hover:text-gray-600 leading-none">
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button type="button" tabIndex={-1} onClick={() => step(-1)}
          className="p-0 text-gray-400 hover:text-gray-600 leading-none">
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
