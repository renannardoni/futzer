'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getQuadras, deleteQuadra, type Quadra } from '@/lib/api';
import { Plus, Pencil, Trash2, MapPin, Star, RefreshCw } from 'lucide-react';

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop";

function getImageSrc(url?: string) {
  if (!url) return FALLBACK_IMAGE;
  if (url.includes("example.com") || url.includes("placeholder.com")) return FALLBACK_IMAGE;
  return url;
}

export default function AdminPage() {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuadras = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getQuadras();
      setQuadras(data);
    } catch {
      setError('Erro ao carregar quadras. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadQuadras(); }, []);

  const handleDelete = async (id: string, nome: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${nome}"?`)) return;
    setDeletingId(id);
    try {
      await deleteQuadra(id);
      setQuadras(prev => prev.filter(q => q.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir quadra');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Top bar */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2 text-[#6AB945] hover:text-[#5aa835] font-bold text-xl">
              ← futzer
            </Link>
            <span className="text-gray-300 dark:text-gray-600">|</span>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadQuadras}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Atualizar
            </button>
            <Link
              href="/admin/quadras/nova"
              className="flex items-center gap-2 bg-[#6AB945] hover:bg-[#5aa835] text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
            >
              <Plus className="w-4 h-4" />
              Nova Quadra
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Quadras</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">{loading ? '—' : quadras.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Avaliação Média</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
              {loading || quadras.length === 0 ? '—' : (quadras.reduce((a, q) => a + q.avaliacao, 0) / quadras.length).toFixed(1)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">Preço Médio/hora</p>
            <p className="text-3xl font-bold text-gray-800 dark:text-white mt-1">
              {loading || quadras.length === 0 ? '—' : `R$ ${(quadras.reduce((a, q) => a + (q.precoPorHora ?? 0), 0) / quadras.length).toFixed(0)}`}
            </p>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6AB945]"></div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {quadras.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Nenhuma quadra cadastrada ainda.</p>
                <Link
                  href="/admin/quadras/nova"
                  className="inline-flex items-center gap-2 bg-[#6AB945] hover:bg-[#5aa835] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Cadastrar primeira quadra
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
                    <tr>
                      <th className="text-left px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Quadra</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Localização</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Tipo</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Preço/hora</th>
                      <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-300">Avaliação</th>
                      <th className="text-right px-6 py-3 font-semibold text-gray-600 dark:text-gray-300">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {quadras.map((quadra) => (
                      <tr key={quadra.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={getImageSrc(quadra.imagemCapa)}
                                alt={quadra.nome}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-800 dark:text-white line-clamp-1">{quadra.nome}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{quadra.descricao}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1 text-gray-600 dark:text-gray-400">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            <span className="line-clamp-1">{quadra.endereco.cidade}, {quadra.endereco.estado}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-block bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 text-xs font-medium px-2.5 py-1 rounded-full capitalize">
                            {quadra.tipoPiso}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white">
                          R$ {(quadra.precoPorHora ?? 0).toFixed(0)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-gray-700 dark:text-gray-300">{quadra.avaliacao}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/admin/quadras/${quadra.id}/editar`}
                              className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                              Editar
                            </Link>
                            <button
                              onClick={() => handleDelete(quadra.id, quadra.nome)}
                              disabled={deletingId === quadra.id}
                              className="flex items-center gap-1.5 text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 border border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              {deletingId === quadra.id ? '...' : 'Excluir'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
