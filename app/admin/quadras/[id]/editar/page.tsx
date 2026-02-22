'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { getQuadraById, type Quadra } from '@/lib/api';
import { QuadraForm } from '@/components/quadra-form';

export default function EditarQuadraPage() {
  const params = useParams();
  const id = params.id as string;
  const [quadra, setQuadra] = useState<Quadra | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getQuadraById(id)
      .then(setQuadra)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#6AB945]"></div>
      </div>
    );
  }

  if (notFound || !quadra) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Quadra não encontrada.</p>
          <Link href="/admin" className="text-[#6AB945] hover:underline">Voltar ao admin</Link>
        </div>
      </div>
    );
  }

  return <QuadraForm mode="editar" quadra={quadra} />;
}
