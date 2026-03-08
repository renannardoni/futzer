"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OwnerGuard } from "@/components/owner-guard";
import { OwnerNav } from "@/components/owner-nav";
import { getMinhasQuadras, deleteQuadra, type Quadra, type User } from "@/lib/api";
import { PlusCircle, Edit2, Trash2, MapPin, Star, Clock } from "lucide-react";

const TIPO_LABEL: Record<string, string> = {
  futebol: "Futebol",
  tenis: "Tênis",
  areia: "Beach / Areia",
};

function Dashboard({ user }: { user: User }) {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    getMinhasQuadras()
      .then(setQuadras)
      .catch(() => setQuadras([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, nome: string) {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    setDeletingId(id);
    try {
      await deleteQuadra(id);
      setQuadras((prev) => prev.filter((q) => q.id !== id));
    } catch {
      alert("Erro ao excluir quadra.");
    } finally {
      setDeletingId(null);
    }
  }

  const stats = {
    total: quadras.length,
    avgRating: quadras.length
      ? (quadras.reduce((s, q) => s + q.avaliacao, 0) / quadras.length).toFixed(1)
      : "—",
    avgPrice: quadras.filter((q) => q.precoPorHora).length
      ? Math.round(
          quadras.filter((q) => q.precoPorHora).reduce((s, q) => s + (q.precoPorHora ?? 0), 0) /
            quadras.filter((q) => q.precoPorHora).length
        )
      : null,
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <OwnerNav user={user} />

      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-500 text-sm mt-0.5">Olá, {user.nome.split(" ")[0]}!</p>
            </div>
            <Link
              href="/owner/quadra/nova"
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2.5 rounded-lg transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              Nova Quadra
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Quadras</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Avaliação média</p>
              <p className="text-3xl font-bold text-gray-900 mt-1 flex items-end gap-1">
                {stats.avgRating}
                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 mb-0.5" />
              </p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Preço médio / hora</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">
                {stats.avgPrice != null ? `R$ ${stats.avgPrice}` : "—"}
              </p>
            </div>
          </div>

          {/* Courts list */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600" />
            </div>
          ) : quadras.length === 0 ? (
            <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-16 text-center">
              <p className="text-gray-500 mb-4">Você ainda não cadastrou nenhuma quadra.</p>
              <Link
                href="/owner/quadra/nova"
                className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                Cadastrar primeira quadra
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {quadras.map((q) => {
                const diasAbertos = q.horariosSemanais
                  ? Object.values(q.horariosSemanais).filter((d) => d.aberto).length
                  : null;
                return (
                  <div
                    key={q.id}
                    className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-5"
                  >
                    {/* Thumb */}
                    {q.imagemCapa && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={q.imagemCapa}
                        alt={q.nome}
                        className="w-16 h-16 rounded-lg object-cover shrink-0"
                      />
                    )}

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="font-semibold text-gray-900 truncate">{q.nome}</p>
                        <span className="shrink-0 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                          {TIPO_LABEL[q.tipoPiso] ?? q.tipoPiso}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        {q.endereco.cidade}, {q.endereco.estado}
                      </p>
                      <div className="flex items-center gap-4 mt-1.5 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                          {q.avaliacao}
                        </span>
                        {q.precoPorHora && <span>R$ {q.precoPorHora}/h</span>}
                        {diasAbertos !== null && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {diasAbertos} dias/sem
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/owner/quadra/${q.id}`}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-green-700 bg-gray-100 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(q.id, q.nome)}
                        disabled={deletingId === q.id}
                        className="flex items-center gap-1.5 text-sm font-medium text-gray-700 hover:text-red-600 bg-gray-100 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        {deletingId === q.id ? "..." : "Excluir"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function OwnerDashboardPage() {
  return <OwnerGuard>{(user) => <Dashboard user={user} />}</OwnerGuard>;
}
