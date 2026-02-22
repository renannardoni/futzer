'use client';

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getQuadraById, type Quadra } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Star, Phone } from "lucide-react";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop";

function isValidImageUrl(url: string) {
  return url && url.startsWith("http") && !url.includes("example.com") && !url.includes("placeholder.com");
}

export default function QuadraPage() {
  const params = useParams();
  const id = params.id as string;
  const [quadra, setQuadra] = useState<Quadra | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);

  useEffect(() => {
    getQuadraById(id)
      .then(setQuadra)
      .catch(() => setNotFoundState(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Carregando quadra...</p>
        </div>
      </div>
    );
  }

  if (notFoundState || !quadra) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold dark:text-white mb-4">Quadra não encontrada</h1>
          <Link href="/" className="text-[#6AB945] hover:underline">Voltar para a busca</Link>
        </div>
      </div>
    );
  }

  const imageSrc = isValidImageUrl(quadra.imagemCapa) ? quadra.imagemCapa : FALLBACK_IMAGE;
  const isLocalImage = imageSrc.includes('localhost');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header com botão voltar */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link href="/" className="inline-flex items-center text-[#6AB945] hover:text-[#5aa835]">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Voltar para busca
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna principal - Fotos e informações */}
          <div className="lg:col-span-2 space-y-6">
            {/* Galeria de fotos */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 relative h-96 rounded-lg overflow-hidden">
                <Image
                  src={imageSrc}
                  alt={quadra.nome}
                  fill
                  className="object-cover"
                  unoptimized={isLocalImage}
                />
              </div>
              {/* Adicionar mais fotos quando tiver backend */}
            </div>

            {/* Título e localização */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-3xl font-bold dark:text-white">{quadra.nome}</h1>
                <div className="flex items-center">
                  <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 font-semibold dark:text-white">{quadra.avaliacao}</span>
                </div>
              </div>
              <div className="flex items-center text-gray-600 dark:text-gray-400">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{quadra.endereco.rua}, {quadra.endereco.cidade}</span>
              </div>
            </div>

            {/* Descrição */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Sobre esta quadra</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {quadra.descricao}
              </p>
            </div>

            {/* Informações adicionais */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Informações</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start">
                  <Users className="w-5 h-5 mr-3 mt-0.5 text-[#6AB945]" />
                  <div>
                    <p className="font-medium dark:text-white">Tipo de piso</p>
                    <p className="text-gray-600 dark:text-gray-400 capitalize">{quadra.tipoPiso}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Clock className="w-5 h-5 mr-3 mt-0.5 text-[#6AB945]" />
                  <div>
                    <p className="font-medium dark:text-white">Localização</p>
                    <p className="text-gray-600 dark:text-gray-400">{quadra.endereco.cidade}, {quadra.endereco.estado}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mapa (adicionar depois) */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
              <h2 className="text-xl font-semibold mb-4 dark:text-white">Localização</h2>
              <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500 dark:text-gray-400">Mapa em desenvolvimento</p>
              </div>
            </div>
          </div>

          {/* Sidebar - Card de reserva */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 sticky top-24">
              <div className="mb-6">
                <div className="flex items-baseline mb-4">
                  {quadra.precoPorHora != null
                    ? <><span className="text-3xl font-bold dark:text-white">R$ {quadra.precoPorHora.toFixed(2)}</span><span className="text-gray-500 dark:text-gray-400 ml-2">/hora</span></>
                    : <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">Consulte o preço</span>
                  }
                </div>
                {quadra.telefone && (
                  <a href={`tel:${quadra.telefone}`} className="flex items-center gap-2 text-sm text-[#6AB945] hover:underline">
                    <Phone className="w-4 h-4" />{quadra.telefone}
                  </a>
                )}
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-200">Data</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#6AB945] focus:border-transparent"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-200">Início</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#6AB945] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-200">Fim</label>
                    <input
                      type="time"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-[#6AB945] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <Button className="w-full bg-[#6AB945] hover:bg-[#5aa835] text-white py-6 text-lg font-semibold">
                Reservar agora
              </Button>

              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                Você ainda não será cobrado
              </p>

              {/* Resumo da reserva (calcular depois) */}
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">{quadra.precoPorHora != null ? `R$ ${quadra.precoPorHora.toFixed(2)} x 1 hora` : 'Consulte o preço'}</span>
                  <span className="dark:text-white">{quadra.precoPorHora != null ? `R$ ${quadra.precoPorHora.toFixed(2)}` : '—'}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">{quadra.precoPorHora != null ? `R$ ${quadra.precoPorHora.toFixed(2)}` : '—'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
