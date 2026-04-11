"use client";

import { useState, useEffect, useCallback } from "react";
import { type HorariosSemanais, type HorarioDia, DEFAULT_HORARIOS_SEMANAIS } from "@/lib/api";
import { TimeInput } from "@/components/time-input";
import { Copy } from "lucide-react";

// ── Helpers ──

function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

function fromMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Gera todos os slots de 15 min entre inicio (inclusive) e fim (exclusive). */
function generateSlots(inicio: string, fim: string): string[] {
  const startMin = toMinutes(inicio);
  const endMin = toMinutes(fim);
  if (startMin >= endMin) return [];
  const slots: string[] = [];
  for (let t = startMin; t < endMin; t += 15) {
    slots.push(fromMinutes(t));
  }
  return slots;
}

// ── Types ──

interface DayRange {
  manha: { inicio: string; fim: string };
  tarde: { inicio: string; fim: string };
  ativo: boolean;
}

type DayKey = keyof HorariosSemanais;

const DIAS: { key: DayKey; label: string }[] = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const DEFAULT_RANGE: DayRange = {
  manha: { inicio: "08:00", fim: "12:00" },
  tarde: { inicio: "14:00", fim: "22:00" },
  ativo: false,
};

// ── Detectar ranges a partir de slots existentes ──

function detectRangesFromSlots(slots: string[]): DayRange {
  if (!slots || slots.length === 0) return { ...DEFAULT_RANGE, ativo: false };

  const sorted = [...slots].sort();
  const manhaSlots = sorted.filter(s => toMinutes(s) < 12 * 60);
  const tardeSlots = sorted.filter(s => toMinutes(s) >= 12 * 60);

  const rangeFrom = (arr: string[], fallbackInicio: string, fallbackFim: string) => {
    if (arr.length === 0) return { inicio: fallbackInicio, fim: fallbackFim };
    const first = arr[0];
    const lastMin = toMinutes(arr[arr.length - 1]) + 15; // fim é exclusive
    return { inicio: first, fim: fromMinutes(lastMin) };
  };

  return {
    manha: rangeFrom(manhaSlots, "08:00", "12:00"),
    tarde: rangeFrom(tardeSlots, "14:00", "22:00"),
    ativo: true,
  };
}

// ── Gerar slots a partir dos ranges ──

function slotsFromRanges(range: DayRange): string[] {
  if (!range.ativo) return [];
  const manha = generateSlots(range.manha.inicio, range.manha.fim);
  const tarde = generateSlots(range.tarde.inicio, range.tarde.fim);
  return [...manha, ...tarde].sort();
}

// ── Component ──

interface Props {
  horariosSemanais: HorariosSemanais;
  datasBloqueadas?: string[];
  onChange: (horarios: HorariosSemanais) => void;
}

export function HorariosForm({ horariosSemanais, onChange }: Props) {
  // Inicializar ranges a partir dos slots existentes
  const [ranges, setRanges] = useState<Record<DayKey, DayRange>>(() => {
    const initial: Record<string, DayRange> = {};
    for (const { key } of DIAS) {
      const slots = horariosSemanais?.[key]?.slots ?? [];
      initial[key] = detectRangesFromSlots(slots);
    }
    return initial as Record<DayKey, DayRange>;
  });

  const emitChange = useCallback((newRanges: Record<DayKey, DayRange>) => {
    const horarios: Record<string, HorarioDia> = {};
    for (const { key } of DIAS) {
      horarios[key] = { slots: slotsFromRanges(newRanges[key]) };
    }
    onChange(horarios as unknown as HorariosSemanais);
  }, [onChange]);

  function updateDay(key: DayKey, partial: Partial<DayRange>) {
    setRanges(prev => {
      const updated = { ...prev, [key]: { ...prev[key], ...partial } };
      emitChange(updated);
      return updated;
    });
  }

  function updateDayPeriod(key: DayKey, period: "manha" | "tarde", field: "inicio" | "fim", value: string) {
    setRanges(prev => {
      const updated = {
        ...prev,
        [key]: {
          ...prev[key],
          [period]: { ...prev[key][period], [field]: value },
        },
      };
      emitChange(updated);
      return updated;
    });
  }

  function applyToAll(sourceKey: DayKey) {
    setRanges(prev => {
      const source = prev[sourceKey];
      const updated = { ...prev };
      for (const { key } of DIAS) {
        updated[key] = { ...source };
      }
      emitChange(updated);
      return updated;
    });
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="hidden sm:grid sm:grid-cols-[80px_1fr_1fr_40px] gap-2 text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-1">
        <div />
        <div className="text-center">Manhã</div>
        <div className="text-center">Tarde</div>
        <div />
      </div>

      {DIAS.map(({ key, label }) => {
        const day = ranges[key];
        const slotCount = slotsFromRanges(day).length;

        return (
          <div
            key={key}
            className={`rounded-xl border p-3 transition-colors ${
              day.ativo
                ? "border-green-200 bg-green-50/50"
                : "border-gray-200 bg-gray-50/50"
            }`}
          >
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              {/* Day label + toggle */}
              <div className="flex items-center gap-2 w-20 shrink-0">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={day.ativo}
                    onChange={e => updateDay(key, { ativo: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-8 h-4.5 bg-gray-300 peer-checked:bg-green-500 rounded-full transition-colors
                    after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3.5 after:w-3.5 after:transition-all
                    peer-checked:after:translate-x-3.5" />
                </label>
                <span className={`text-sm font-semibold ${day.ativo ? "text-green-700" : "text-gray-400"}`}>
                  {label}
                </span>
              </div>

              {/* Ranges — fade when inactive */}
              <div className={`flex-1 flex items-center gap-2 sm:gap-3 flex-wrap sm:flex-nowrap transition-opacity ${day.ativo ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                {/* Manhã */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium text-amber-600 uppercase w-10 sm:w-11 shrink-0">Manhã</span>
                  <TimeInput value={day.manha.inicio} onChange={v => updateDayPeriod(key, "manha", "inicio", v)} className="w-[70px] sm:w-[80px]" min="05:00" max="12:00" />
                  <span className="text-gray-400 text-xs">–</span>
                  <TimeInput value={day.manha.fim} onChange={v => updateDayPeriod(key, "manha", "fim", v)} className="w-[70px] sm:w-[80px]" min="05:00" max="13:00" />
                </div>

                {/* Tarde */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] font-medium text-blue-600 uppercase w-10 sm:w-11 shrink-0">Tarde</span>
                  <TimeInput value={day.tarde.inicio} onChange={v => updateDayPeriod(key, "tarde", "inicio", v)} className="w-[70px] sm:w-[80px]" min="12:00" max="23:00" />
                  <span className="text-gray-400 text-xs">–</span>
                  <TimeInput value={day.tarde.fim} onChange={v => updateDayPeriod(key, "tarde", "fim", v)} className="w-[70px] sm:w-[80px]" min="12:00" max="23:45" />
                </div>

                {/* Slot count */}
                <span className="text-[10px] text-gray-400 whitespace-nowrap hidden lg:inline">
                  {slotCount > 0 ? `${slotCount} slots` : "—"}
                </span>
              </div>

              {/* Apply to all */}
              <button
                type="button"
                onClick={() => applyToAll(key)}
                title={`Aplicar config de ${label} para todos os dias`}
                className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded-lg transition-colors shrink-0"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-gray-400 mt-2">
        Configure os horários de manhã e tarde para cada dia. Clique no ícone <Copy className="w-3 h-3 inline" /> para copiar a configuração de um dia para todos.
      </p>
    </div>
  );
}
