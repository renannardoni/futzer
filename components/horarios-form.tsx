"use client";

import { useState } from "react";
import { type HorariosSemanais, DEFAULT_HORARIOS_SEMANAIS, generateAllSlots } from "@/lib/api";

const DIAS: { key: keyof HorariosSemanais; label: string }[] = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const ALL_SLOTS = generateAllSlots(6, 23); // "06:00" .. "23:00"

// Agrupar slots por hora para visualização compacta
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23

interface Props {
  horariosSemanais: HorariosSemanais;
  datasBloqueadas?: string[];
  onChange: (horarios: HorariosSemanais) => void;
}

export function HorariosForm({ horariosSemanais, onChange }: Props) {
  const [horarios, setHorarios] = useState<HorariosSemanais>(
    horariosSemanais ?? DEFAULT_HORARIOS_SEMANAIS
  );
  const [expandedHour, setExpandedHour] = useState<number | null>(null);

  function toggleSlot(dia: keyof HorariosSemanais, slot: string) {
    const slots = horarios[dia].slots ?? [];
    const newSlots = slots.includes(slot)
      ? slots.filter((s) => s !== slot)
      : [...slots, slot].sort();
    const updated = { ...horarios, [dia]: { slots: newSlots } };
    setHorarios(updated);
    onChange(updated);
  }

  function toggleHour(dia: keyof HorariosSemanais, hour: number) {
    const slots = horarios[dia].slots ?? [];
    const hourSlots = [`${String(hour).padStart(2, "0")}:00`, `${String(hour).padStart(2, "0")}:15`, `${String(hour).padStart(2, "0")}:30`, `${String(hour).padStart(2, "0")}:45`];
    const allActive = hourSlots.every((s) => slots.includes(s));
    let newSlots: string[];
    if (allActive) {
      newSlots = slots.filter((s) => !hourSlots.includes(s));
    } else {
      newSlots = [...new Set([...slots, ...hourSlots])].sort();
    }
    const updated = { ...horarios, [dia]: { slots: newSlots } };
    setHorarios(updated);
    onChange(updated);
  }

  function toggleDia(dia: keyof HorariosSemanais) {
    const slots = horarios[dia].slots ?? [];
    const allSelected = slots.length === ALL_SLOTS.length;
    const updated = { ...horarios, [dia]: { slots: allSelected ? [] : [...ALL_SLOTS] } };
    setHorarios(updated);
    onChange(updated);
  }

  function countActiveInHour(dia: keyof HorariosSemanais, hour: number): number {
    const slots = horarios[dia].slots ?? [];
    const prefix = String(hour).padStart(2, "0");
    return slots.filter((s) => s.startsWith(prefix + ":")).length;
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-10 text-left text-gray-400 font-normal pb-3 pr-3 sticky left-0 bg-white" />
            {HOURS.map((h) => (
              <th key={h} className="text-center text-gray-400 font-normal pb-3 px-0.5 min-w-[34px]">
                <button
                  type="button"
                  onClick={() => setExpandedHour(expandedHour === h ? null : h)}
                  className="hover:text-gray-600 transition-colors"
                  title={`Expandir ${h}h`}
                >
                  {h}h
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {DIAS.map(({ key, label }) => {
            const slots = horarios[key]?.slots ?? [];
            const allSelected = slots.length === ALL_SLOTS.length;
            return (
              <tr key={key}>
                <td className="pr-2 py-1 sticky left-0 bg-white">
                  <button
                    type="button"
                    onClick={() => toggleDia(key)}
                    title={allSelected ? "Limpar dia" : "Selecionar todos"}
                    className={`text-xs font-semibold w-9 py-1.5 rounded transition-colors ${
                      allSelected
                        ? "text-green-700 bg-green-50"
                        : slots.length > 0
                        ? "text-green-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    {label}
                  </button>
                </td>
                {HOURS.map((hour) => {
                  const count = countActiveInHour(key, hour);
                  const allFour = count === 4;
                  return (
                    <td key={hour} className="px-0.5 py-1">
                      <button
                        type="button"
                        onClick={() => toggleHour(key, hour)}
                        title={`${label} ${hour}h — ${count}/4 slots`}
                        className={`w-8 h-8 rounded-md text-xs font-medium transition-all relative ${
                          allFour
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : count > 0
                            ? "bg-green-200 text-green-800 hover:bg-green-300"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {hour}
                        {count > 0 && count < 4 && (
                          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-green-600 text-white text-[9px] rounded-full flex items-center justify-center">
                            {count}
                          </span>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Painel expandido para slots de 15 min */}
      {expandedHour !== null && (
        <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-gray-700">
              {expandedHour}h — Slots de 15 min
            </span>
            <button
              type="button"
              onClick={() => setExpandedHour(null)}
              className="text-gray-400 hover:text-gray-600 text-xs"
            >
              Fechar
            </button>
          </div>
          <div className="grid grid-cols-4 gap-2 mb-2">
            {[":00", ":15", ":30", ":45"].map((suffix) => {
              const slot = `${String(expandedHour).padStart(2, "0")}${suffix}`;
              return (
                <div key={slot} className="text-center text-xs font-medium text-gray-500">
                  {slot}
                </div>
              );
            })}
          </div>
          {DIAS.map(({ key, label }) => {
            const slots = horarios[key]?.slots ?? [];
            return (
              <div key={key} className="flex items-center gap-2 mb-1">
                <span className="text-xs text-gray-500 w-8">{label}</span>
                <div className="grid grid-cols-4 gap-2 flex-1">
                  {[":00", ":15", ":30", ":45"].map((suffix) => {
                    const slot = `${String(expandedHour).padStart(2, "0")}${suffix}`;
                    const active = slots.includes(slot);
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => toggleSlot(key, slot)}
                        className={`py-1.5 rounded text-xs font-medium transition-all ${
                          active
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-white text-gray-400 hover:bg-gray-100 border border-gray-200"
                        }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        Clique numa hora para ativar/desativar todos os 4 slots. Clique no cabeçalho da hora para expandir e selecionar slots de 15 min individualmente.
      </p>
    </div>
  );
}
