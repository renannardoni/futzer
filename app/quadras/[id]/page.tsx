import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { mockCourts } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Star } from "lucide-react";
import { Court } from "@/types/court";

export default async function QuadraPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const quadra = mockCourts.find((c: Court) => c.id === id);

  if (!quadra) {
    notFound();
  }

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
                  src={quadra.imagemCapa}
                  alt={quadra.nome}
                  fill
                  className="object-cover"
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
                  <span className="text-3xl font-bold dark:text-white">R$ {quadra.precoPorHora.toFixed(2)}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">/hora</span>
                </div>
              </div>

              {/* Formulário de reserva (a ser implementado) */}
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
                  <span className="text-gray-600 dark:text-gray-400">R$ {quadra.precoPorHora.toFixed(2)} x 1 hora</span>
                  <span className="dark:text-white">R$ {quadra.precoPorHora.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg mt-4">
                  <span className="dark:text-white">Total</span>
                  <span className="dark:text-white">R$ {quadra.precoPorHora.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
