"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { OwnerGuard } from "@/components/owner-guard";
import { OwnerNav } from "@/components/owner-nav";
import { QuadraForm } from "@/components/quadra-form";
import { HorariosForm } from "@/components/horarios-form";
import {
  getQuadraById,
  updateQuadra,
  type Quadra,
  type User,
  type HorariosSemanais,
  DEFAULT_HORARIOS_SEMANAIS,
} from "@/lib/api";

type Tab = "info" | "horarios";

function EditarQuadraContent({ user }: { user: User }) {
  const params = useParams();
  const id = params.id as string;

  const [quadra, setQuadra] = useState<Quadra | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("info");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  // Horários locais (editados pelo HorariosForm)
  const [horarios, setHorarios] = useState<HorariosSemanais>(DEFAULT_HORARIOS_SEMANAIS);
  const [datas, setDatas] = useState<string[]>([]);

  useEffect(() => {
    getQuadraById(id)
      .then((q) => {
        setQuadra(q);
        setHorarios(q.horariosSemanais ?? DEFAULT_HORARIOS_SEMANAIS);
        setDatas(q.datasBloqueadas ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function saveHorarios() {
    if (!quadra) return;
    setSaving(true);
    setSaveMsg(null);
    try {
      await updateQuadra(quadra.id, {
        horariosSemanais: horarios,
        datasBloqueadas: datas,
      });
      setSaveMsg("Horários salvos!");
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      setSaveMsg("Erro ao salvar. Tente novamente.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OwnerNav user={user} />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
        </main>
      </div>
    );
  }

  if (!quadra) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <OwnerNav user={user} />
        <main className="flex-1 flex items-center justify-center">
          <p className="text-gray-500">Quadra não encontrada.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerNav user={user} />

      <main className="flex-1 p-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">{quadra.nome}</h1>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 mb-8">
            {(["info", "horarios"] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-5 py-2.5 text-sm font-semibold border-b-2 transition-colors ${
                  tab === t
                    ? "border-green-600 text-green-700"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "info" ? "Informações" : "Horários"}
              </button>
            ))}
          </div>

          {tab === "info" && (
            <QuadraForm quadra={quadra} mode="editar" redirectTo="/owner" />
          )}

          {tab === "horarios" && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <HorariosForm
                horariosSemanais={horarios}
                datasBloqueadas={datas}
                onChange={(h) => setHorarios(h)}
              />

              <div className="flex items-center gap-4 mt-8 pt-6 border-t border-gray-100">
                <button
                  onClick={saveHorarios}
                  disabled={saving}
                  className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
                >
                  {saving ? "Salvando..." : "Salvar horários"}
                </button>
                {saveMsg && (
                  <span className={`text-sm font-medium ${saveMsg.startsWith("Erro") ? "text-red-600" : "text-green-600"}`}>
                    {saveMsg}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function EditarQuadraPage() {
  return <OwnerGuard>{(user) => <EditarQuadraContent user={user} />}</OwnerGuard>;
}
