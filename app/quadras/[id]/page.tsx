'use client';

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getQuadraById, type Quadra } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Users, Star, Phone, Grid2X2, ChevronLeft, ChevronRight, X, Lock } from "lucide-react";

const QuadraMap = dynamic(
  () => import('@/components/quadra-map').then(m => m.QuadraMap),
  { ssr: false, loading: () => <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6AB945]" /></div> }
);

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop";

function isValidImageUrl(url?: string | null) {
  return url && url.startsWith("http") && !url.includes("example.com") && !url.includes("placeholder.com");
}

function buildAllImages(quadra: Quadra): string[] {
  const all: string[] = [];
  const capa = isValidImageUrl(quadra.imagemCapa) ? quadra.imagemCapa : FALLBACK_IMAGE;
  all.push(capa);
  (quadra.imagens ?? []).forEach(img => {
    if (isValidImageUrl(img) && img !== capa) all.push(img);
  });
  return all;
}

// ─── Lightbox ───────────────────────────────────────────────────────────────
interface LightboxProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

function Lightbox({ images, initialIndex, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);

  const prev = useCallback(() => setCurrent(i => (i - 1 + images.length) % images.length), [images.length]);
  const next = useCallback(() => setCurrent(i => (i + 1) % images.length), [images.length]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      else if (e.key === 'ArrowRight') next();
      else if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [prev, next, onClose]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col" onClick={onClose}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4" onClick={e => e.stopPropagation()}>
        <span className="text-white font-medium text-sm">{current + 1} / {images.length}</span>
        <button onClick={onClose} className="text-white hover:bg-white/20 rounded-full p-2 transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Main image */}
      <div className="flex-1 flex items-center justify-center relative px-16" onClick={e => e.stopPropagation()}>
        <button onClick={prev} className="absolute left-4 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition-colors z-10">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="relative w-full max-w-4xl" style={{ height: 'calc(100vh - 220px)' }}>
          <Image
            src={images[current]}
            alt={`Foto ${current + 1}`}
            fill
            className="object-contain"
            unoptimized={images[current].includes('localhost')}
            sizes="100vw"
          />
        </div>
        <button onClick={next} className="absolute right-4 bg-white/10 hover:bg-white/30 text-white rounded-full p-3 transition-colors z-10">
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Thumbnail strip */}
      <div className="flex gap-2 justify-center px-6 py-4 overflow-x-auto" onClick={e => e.stopPropagation()}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
              i === current ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
            }`}
          >
            <Image src={img} alt={`Miniatura ${i + 1}`} fill className="object-cover" unoptimized={img.includes('localhost')} sizes="64px" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Gallery ─────────────────────────────────────────────────────────────────
function ShowAllButton({ total, onClick }: { total: number; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      onClick={onClick}
      className="absolute bottom-4 right-4 flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 dark:border-gray-600 z-10"
    >
      <Grid2X2 className="w-4 h-4" />
      Mostrar todas as fotos ({total})
    </button>
  );
}

function GalleryCell({ src, index, extra, onOpen, sizes }: {
  src: string; index: number; extra?: number;
  onOpen: (i: number) => void; sizes: string;
}) {
  return (
    <div className="relative w-full h-full cursor-pointer group overflow-hidden" onClick={() => onOpen(index)}>
      <Image src={src} alt={`Foto ${index + 1}`} fill className="object-cover transition-transform duration-300 group-hover:scale-105" unoptimized={src.includes('localhost')} sizes={sizes} />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
      {extra != null && extra > 0 && (
        <div className="absolute inset-0 bg-black/55 flex items-center justify-center pointer-events-none">
          <span className="text-white font-bold text-2xl">+{extra}</span>
        </div>
      )}
    </div>
  );
}

interface GalleryProps {
  images: string[];
  onOpenLightbox: (index: number) => void;
}

function Gallery({ images, onOpenLightbox }: GalleryProps) {
  const count = images.length;
  const shown = images.slice(0, 5);
  const H = "h-[420px]";

  // 1 photo — full width
  if (count === 1) {
    return (
      <div className={`relative w-full ${H} rounded-xl overflow-hidden`}>
        <GalleryCell src={shown[0]} index={0} onOpen={onOpenLightbox} sizes="100vw" />
        <ShowAllButton total={count} onClick={e => { e.stopPropagation(); onOpenLightbox(0); }} />
      </div>
    );
  }

  // 2 photos — two equal columns
  if (count === 2) {
    return (
      <div className={`relative flex gap-2 ${H} rounded-xl overflow-hidden`}>
        <div className="flex-1 relative"><GalleryCell src={shown[0]} index={0} onOpen={onOpenLightbox} sizes="50vw" /></div>
        <div className="flex-1 relative"><GalleryCell src={shown[1]} index={1} onOpen={onOpenLightbox} sizes="50vw" /></div>
        <ShowAllButton total={count} onClick={e => { e.stopPropagation(); onOpenLightbox(0); }} />
      </div>
    );
  }

  // 3 photos — 1 large left (60%) + 2 stacked right (40%)
  if (count === 3) {
    return (
      <div className={`relative flex gap-2 ${H} rounded-xl overflow-hidden`}>
        <div className="relative" style={{ flex: '3' }}><GalleryCell src={shown[0]} index={0} onOpen={onOpenLightbox} sizes="60vw" /></div>
        <div className="flex flex-col gap-2" style={{ flex: '2' }}>
          <div className="flex-1 relative"><GalleryCell src={shown[1]} index={1} onOpen={onOpenLightbox} sizes="40vw" /></div>
          <div className="flex-1 relative"><GalleryCell src={shown[2]} index={2} onOpen={onOpenLightbox} sizes="40vw" /></div>
        </div>
        <ShowAllButton total={count} onClick={e => { e.stopPropagation(); onOpenLightbox(0); }} />
      </div>
    );
  }

  // 4 photos — 1 large left (50%) + right: top full + bottom split 2
  if (count === 4) {
    return (
      <div className={`relative flex gap-2 ${H} rounded-xl overflow-hidden`}>
        <div className="flex-1 relative"><GalleryCell src={shown[0]} index={0} onOpen={onOpenLightbox} sizes="50vw" /></div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 relative"><GalleryCell src={shown[1]} index={1} onOpen={onOpenLightbox} sizes="50vw" /></div>
          <div className="flex-1 flex gap-2">
            <div className="flex-1 relative"><GalleryCell src={shown[2]} index={2} onOpen={onOpenLightbox} sizes="25vw" /></div>
            <div className="flex-1 relative"><GalleryCell src={shown[3]} index={3} onOpen={onOpenLightbox} sizes="25vw" /></div>
          </div>
        </div>
        <ShowAllButton total={count} onClick={e => { e.stopPropagation(); onOpenLightbox(0); }} />
      </div>
    );
  }

  // 5+ photos — 1 large left (50%) + right 2x2 grid
  return (
    <div className={`relative flex gap-2 ${H} rounded-xl overflow-hidden`}>
      <div className="flex-1 relative"><GalleryCell src={shown[0]} index={0} onOpen={onOpenLightbox} sizes="50vw" /></div>
      <div className="flex-1 grid grid-cols-2 grid-rows-2 gap-2">
        {shown.slice(1).map((img, i) => (
          <div key={i} className="relative">
            <GalleryCell src={img} index={i + 1} extra={i === 3 ? count - 5 : undefined} onOpen={onOpenLightbox} sizes="25vw" />
          </div>
        ))}
      </div>
      <ShowAllButton total={count} onClick={e => { e.stopPropagation(); onOpenLightbox(0); }} />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function QuadraPage() {
  const params = useParams();
  const id = params.id as string;
  const [quadra, setQuadra] = useState<Quadra | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFoundState, setNotFoundState] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

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

  const allImages = buildAllImages(quadra);

  return (
    <>
      {lightboxIndex !== null && (
        <Lightbox images={allImages} initialIndex={lightboxIndex} onClose={() => setLightboxIndex(null)} />
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
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
          {/* Title row */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold dark:text-white">{quadra.nome}</h1>
            <div className="flex items-center gap-3 mt-1 text-gray-600 dark:text-gray-400 flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-800 dark:text-white">{quadra.avaliacao}</span>
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {quadra.endereco.rua}, {quadra.endereco.cidade} — {quadra.endereco.estado}
              </span>
            </div>
          </div>

          {/* Gallery */}
          <div className="mb-8">
            <Gallery images={allImages} onOpenLightbox={setLightboxIndex} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Sobre esta quadra</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{quadra.descricao}</p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Informações</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Users className="w-5 h-5 mr-3 mt-0.5 text-[#6AB945]" />
                    <div>
                      <p className="font-medium dark:text-white">Esporte</p>
                      <p className="text-gray-600 dark:text-gray-400">
                        {quadra.tipoPiso === 'futebol' ? '⚽ Futebol'
                          : quadra.tipoPiso === 'tenis' ? '🎾 Tênis'
                          : quadra.tipoPiso}
                      </p>
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

              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700">
                <h2 className="text-xl font-semibold mb-4 dark:text-white">Localização</h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  <QuadraMap lat={quadra.coordenadas.lat} lng={quadra.coordenadas.lng} nome={quadra.nome} />
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {quadra.endereco.rua}, {quadra.endereco.cidade} — {quadra.endereco.estado}{quadra.endereco.cep ? `, ${quadra.endereco.cep}` : ''}
                </p>
              </div>
            </div>

            {/* Sidebar - reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border dark:border-gray-700 sticky top-24">

                {/* Price + phone — always visible */}
                <div className="mb-6">
                  <div className="flex items-baseline mb-4">
                    {quadra.modalidade === 'publica' ? (
                      <span className="text-2xl font-bold text-[#6AB945]">Gratuita</span>
                    ) : quadra.modalidade === 'clube' ? (
                      <span className="text-2xl font-bold text-gray-700 dark:text-gray-200">Sócio</span>
                    ) : quadra.precoPorHora != null ? (
                      <><span className="text-3xl font-bold dark:text-white">R$ {quadra.precoPorHora.toFixed(2)}</span><span className="text-gray-500 dark:text-gray-400 ml-2">/hora</span></>
                    ) : (
                      <span className="text-xl font-semibold text-gray-500 dark:text-gray-400">Consulte o preço</span>
                    )}
                  </div>
                  {quadra.telefone && (
                    <a href={`tel:${quadra.telefone}`} className="flex items-center gap-2 text-sm text-[#6AB945] hover:underline">
                      <Phone className="w-4 h-4" />{quadra.telefone}
                    </a>
                  )}
                </div>

                {/* ALUGUEL — booking form (locked, em breve) */}
                {quadra.modalidade === 'aluguel' && (
                  <>
                    <div className="space-y-4 mb-6 opacity-50 pointer-events-none select-none">
                      <div>
                        <label className="block text-sm font-medium mb-2 dark:text-gray-200">Data</label>
                        <input disabled type="date" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Início</label>
                          <input disabled type="time" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2 dark:text-gray-200">Fim</label>
                          <input disabled type="time" className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
                        </div>
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full flex items-center justify-center gap-2 bg-[#6AB945] text-white py-4 text-lg font-semibold rounded-lg opacity-50 cursor-not-allowed"
                    >
                      <Lock className="w-5 h-5" />
                      Reservar quadra
                    </button>
                    <p className="text-center text-sm text-gray-400 dark:text-gray-500 mt-3 flex items-center justify-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Disponível em breve
                    </p>

                    <div className="mt-6 pt-6 border-t dark:border-gray-700">
                      <div className="flex justify-between mb-2 opacity-50">
                        <span className="text-gray-600 dark:text-gray-400">{quadra.precoPorHora != null ? `R$ ${quadra.precoPorHora.toFixed(2)} x 1 hora` : 'Consulte o preço'}</span>
                        <span className="dark:text-white">{quadra.precoPorHora != null ? `R$ ${quadra.precoPorHora.toFixed(2)}` : '—'}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-lg mt-4 opacity-50">
                        <span className="dark:text-white">Total</span>
                        <span className="dark:text-white">{quadra.precoPorHora != null ? `R$ ${quadra.precoPorHora.toFixed(2)}` : '—'}</span>
                      </div>
                    </div>
                  </>
                )}

                {/* PÚBLICA */}
                {quadra.modalidade === 'publica' && (
                  <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 text-sm text-green-800 dark:text-green-300">
                    🏟️ Esta é uma quadra pública de acesso gratuito. Entre em contato ou visite o local para mais informações.
                  </div>
                )}

                {/* CLUBE */}
                {quadra.modalidade === 'clube' && (
                  <div className="rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 text-sm text-blue-800 dark:text-blue-300">
                    🏅 Esta quadra é de uso exclusivo para sócios. Entre em contato com o clube para informações sobre associação.
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
