'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getQuadras, type Quadra } from '@/lib/api';
import { Header } from '@/components/header';
import { CourtsFilters } from '@/components/courts-filters';
import { CourtCard } from '@/components/court-card';

export default function QuadrasPage() {
  const [quadras, setQuadras] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    tipo: '',
    cidade: '',
    preco_max: undefined as number | undefined,
  });

  useEffect(() => {
    loadQuadras();
  }, []);

  const loadQuadras = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getQuadras(filters);
      setQuadras(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar quadras');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
  };

  const handleSearch = () => {
    loadQuadras();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Quadras Disponíveis</h1>
          <p className="text-gray-600">
            Encontre a quadra perfeita para seu jogo
          </p>
        </div>

        <CourtsFilters 
          onFilterChange={handleFilterChange}
          onSearch={handleSearch}
        />

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600">Carregando quadras...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {!loading && !error && quadras.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-600 mb-4">Nenhuma quadra encontrada</p>
            <p className="text-gray-500 mb-6">
              Ajuste os filtros ou cadastre uma nova quadra
            </p>
            <Link
              href="/cadastrar-quadra"
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
            >
              Cadastrar Quadra
            </Link>
          </div>
        )}

        {!loading && !error && quadras.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quadras.map((quadra) => (
              <CourtCard key={quadra.id} court={quadra} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
