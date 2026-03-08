"use client";

import { useState } from "react";
import { type HorariosSemanais, type HorarioDia, DEFAULT_HORARIOS_SEMANAIS } from "@/lib/api";
import { X, Plus, Lock, Unlock } from "lucide-react";

const DIAS: { key: keyof HorariosSemanais; label: string }[] = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

interface Props {
  horariosSemanais: HorariosSemanais;
  datasBloqueadas: string[];
  onChange: (horarios: HorariosSemanais, datas: string[]) => void;
}

export function HorariosForm({ horariosSemanais, datasBloqueadas, onChange }: Props) {
  const [horarios, setHorarios] = useState<HorariosSemanais>(
    horariosSemanais ?? DEFAULT_HORARIOS_SEMANAIS
  );
  const [datas, setDatas] = useState<string[]>(datasBloqueadas ?? []);
  const [novaData, setNovaData] = useState("");

  function updateDia(key: keyof HorariosSemanais, field: keyof HorarioDia, value: string | boolean | number) {
    const updated = {
      ...horarios,
      [key]: { ...horarios[key], [field]: value },
    };
    setHorarios(updated);
    onChange(updated, datas);
  }

  function addData() {
    if (!novaData || datas.includes(novaData)) return;
    const updated = [...datas, novaData].sort();
    setDatas(updated);
    setNovaData("");
    onChange(horarios, updated);
  }

  function removeData(d: string) {
    const updated = datas.filter((x) => x !== d);
    setDatas(updated);
    onChange(horarios, updated);
  }

  function formatDataBR(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  }

  return (
    <div className="space-y-8">
      {/* Grade semanal */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Grade semanal</h3>
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600 w-28">Dia</th>
                <th className="text-center px-4 py-2.5 font-medium text-gray-600 w-20">Aberto</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Início</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Fim</th>
                <th className="text-left px-4 py-2.5 font-medium text-gray-600">Intervalo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {DIAS.map(({ key, label }) => {
                const dia = horarios[key];
                return (
                  <tr key={key} className={dia.aberto ? "" : "bg-gray-50 opacity-60"}>
                    <td className="px-4 py-2.5 font-medium text-gray-700">{label}</td>
                    <td className="px-4 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => updateDia(key, "aberto", !dia.aberto)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors ${
                          dia.aberto
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                        }`}
                      >
                        {dia.aberto ? <Unlock className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
                        {dia.aberto ? "Sim" : "Não"}
                      </button>
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="time"
                        value={dia.inicio}
                        disabled={!dia.aberto}
                        onChange={(e) => updateDia(key, "inicio", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <input
                        type="time"
                        value={dia.fim}
                        disabled={!dia.aberto}
                        onChange={(e) => updateDia(key, "fim", e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </td>
                    <td className="px-4 py-2.5">
                      <select
                        value={dia.intervalo}
                        disabled={!dia.aberto}
                        onChange={(e) => updateDia(key, "intervalo", Number(e.target.value))}
                        className="border border-gray-300 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <option value={30}>30 min</option>
                        <option value={60}>1 hora</option>
                        <option value={90}>1h30</option>
                        <option value={120}>2 horas</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Datas bloqueadas */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1">Datas bloqueadas</h3>
        <p className="text-xs text-gray-500 mb-3">Feriados, manutenção ou qualquer dia que a quadra não estará disponível.</p>

        <div className="flex gap-2 mb-3">
          <input
            type="date"
            value={novaData}
            onChange={(e) => setNovaData(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <button
            type="button"
            onClick={addData}
            disabled={!novaData}
            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-40 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Bloquear
          </button>
        </div>

        {datas.length === 0 ? (
          <p className="text-sm text-gray-400 italic">Nenhuma data bloqueada.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {datas.map((d) => (
              <span
                key={d}
                className="flex items-center gap-1.5 bg-red-50 text-red-700 border border-red-200 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                {formatDataBR(d)}
                <button type="button" onClick={() => removeData(d)} className="hover:text-red-900">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
