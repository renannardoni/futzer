"use client";

import { useState } from "react";
import { type HorariosSemanais, DEFAULT_HORARIOS_SEMANAIS } from "@/lib/api";

const DIAS: { key: keyof HorariosSemanais; label: string }[] = [
  { key: "seg", label: "Seg" },
  { key: "ter", label: "Ter" },
  { key: "qua", label: "Qua" },
  { key: "qui", label: "Qui" },
  { key: "sex", label: "Sex" },
  { key: "sab", label: "Sáb" },
  { key: "dom", label: "Dom" },
];

const HORAS = Array.from({ length: 18 }, (_, i) => i + 6); // 6..23

interface Props {
  horariosSemanais: HorariosSemanais;
  datasBloqueadas?: string[];
  onChange: (horarios: HorariosSemanais) => void;
}

export function HorariosForm({ horariosSemanais, onChange }: Props) {
  const [horarios, setHorarios] = useState<HorariosSemanais>(
    horariosSemanais ?? DEFAULT_HORARIOS_SEMANAIS
  );

  function toggleSlot(dia: keyof HorariosSemanais, hora: number) {
    const slots = horarios[dia].slots ?? [];
    const newSlots = slots.includes(hora)
      ? slots.filter((h) => h !== hora)
      : [...slots, hora].sort((a, b) => a - b);
    const updated = { ...horarios, [dia]: { slots: newSlots } };
    setHorarios(updated);
    onChange(updated);
  }

  function toggleDia(dia: keyof HorariosSemanais) {
    const slots = horarios[dia].slots ?? [];
    const allSelected = slots.length === HORAS.length;
    const updated = { ...horarios, [dia]: { slots: allSelected ? [] : [...HORAS] } };
    setHorarios(updated);
    onChange(updated);
  }

  return (
    <div className="overflow-x-auto">
      <table className="text-xs border-collapse">
        <thead>
          <tr>
            <th className="w-10 text-left text-gray-400 font-normal pb-3 pr-3 sticky left-0 bg-white" />
            {HORAS.map((h) => (
              <th key={h} className="text-center text-gray-400 font-normal pb-3 px-0.5 min-w-[34px]">
                {h}h
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {DIAS.map(({ key, label }) => {
            const slots = horarios[key]?.slots ?? [];
            const allSelected = slots.length === HORAS.length;
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
                {HORAS.map((hora) => {
                  const active = slots.includes(hora);
                  return (
                    <td key={hora} className="px-0.5 py-1">
                      <button
                        type="button"
                        onClick={() => toggleSlot(key, hora)}
                        title={`${label} ${hora}:00`}
                        className={`w-8 h-8 rounded-md text-xs font-medium transition-all ${
                          active
                            ? "bg-green-500 text-white hover:bg-green-600"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                        }`}
                      >
                        {hora}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-4">
        Clique num horário para ativar/desativar. Clique no dia para selecionar/limpar todos.
      </p>
    </div>
  );
}
