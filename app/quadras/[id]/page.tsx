'use client';

import { useEffect, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getQuadraById, slotsOcupados, DURACAO_OPTIONS, type Quadra } from "@/lib/api";
import { MapPin, Clock, Users, Star, Phone, Grid2X2, ChevronLeft, ChevronRight, X, MessageCircle } from "lucide-react";

// ── Helpers ──
const DAY_KEYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sab"] as const;
const DAY_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

function todayISO() { return new Date().toISOString().slice(0, 10); }
function getDayKey(iso: string) { return DAY_KEYS[new Date(iso + "T12:00:00").getDay()]; }

function buildWhatsAppUrl(phone: string, courtName: string, date: string, horaInicio: string, duracao: number) {
  const d = new Date(date + "T12:00:00");
  const dayStr = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  const cleanPhone = phone.replace(/\D/g, "");
  const fullPhone = cleanPhone.startsWith("55") ? cleanPhone : `55${cleanPhone}`;
  const duracaoLabel = DURACAO_OPTIONS.find(o => o.value === duracao)?.label ?? `${duracao}min`;
  const msg = encodeURIComponent(`Olá! Gostaria de reservar a ${courtName} no dia ${dayStr} às ${horaInicio} (${duracaoLabel}).`);
  return `https://wa.me/${fullPhone}?text=${msg}`;
}

// ── Availability Sidebar ──
function AvailabilitySidebar({ quadra }: { quadra: Quadra }) {
  const [selectedDate, setSelectedDate] = useState(todayISO());
  const [dateOffset, setDateOffset] = useState(0);
  const courts = quadra.quadrasInternas ?? [];
  const [selectedCourtId, setSelectedCourtId] = useState(courts[0]?.id ?? "");
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const minDuracao = quadra.duracaoMinima ?? 0;
  const duracaoOptions = DURACAO_OPTIONS.filter(o => o.value >= minDuracao);
  const [selectedDuracao, setSelectedDuracao] = useState(Math.max(60, minDuracao));

  const selectedCourt = courts.find(c => c.id === selectedCourtId) ?? courts[0];
  const dayKey = getDayKey(selectedDate);
  const availableSlots = selectedCourt?.horariosSemanais?.[dayKey]?.slots ?? [];
  const reservas = quadra.reservas ?? [];
  const dayReservas = reservas.filter(r => r.data === selectedDate && r.quadra_id === selectedCourtId);

  const dates = Array.from({ length: 8 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + dateOffset + i);
    return d.toISOString().slice(0, 10);
  });

  const MONTH_NAMES = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
  const monthLabel = (() => {
    const first = new Date(dates[0] + "T12:00:00");
    const last = new Date(dates[dates.length - 1] + "T12:00:00");
    const m1 = MONTH_NAMES[first.getMonth()];
    const m2 = MONTH_NAMES[last.getMonth()];
    const y1 = first.getFullYear();
    const y2 = last.getFullYear();
    if (m1 === m2) return `${m1} ${y1}`;
    if (y1 === y2) return `${m1} / ${m2} ${y1}`;
    return `${m1} ${y1} / ${m2} ${y2}`;
  })();

  // Pre-compute occupied slots
  const occupiedSet = new Set<string>();
  dayReservas.forEach(r => {
    slotsOcupados(r.hora_inicio, r.duracao ?? 60).forEach(s => occupiedSet.add(s));
  });

  // Check if selecting a slot with current duration would conflict
  function wouldConflict(slot: string) {
    const [sh, sm] = slot.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const slotsNeeded = Math.floor(selectedDuracao / 15);
    for (let i = 0; i < slotsNeeded; i++) {
      const t = startMin + i * 15;
      const s = `${String(Math.floor(t / 60)).padStart(2, "0")}:${String(t % 60).padStart(2, "0")}`;
      if (occupiedSet.has(s) || !availableSlots.includes(s)) return true;
    }
    return false;
  }

  // Format selected date nicely
  const selectedDateObj = new Date(selectedDate + "T12:00:00");
  const selectedDateLabel = `${DAY_NAMES[selectedDateObj.getDay()]}, ${String(selectedDateObj.getDate()).padStart(2,"0")}/${String(selectedDateObj.getMonth()+1).padStart(2,"0")}`;

  // Conflict message for selected slot
  const selectedConflict = selectedSlot && !occupiedSet.has(selectedSlot) && wouldConflict(selectedSlot);

  return (
    <div className="space-y-5">
      {/* Date strip */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-semibold text-gray-800">Data</label>
          <span className="text-sm text-gray-500 font-medium">{monthLabel}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setDateOffset(p => Math.max(p - 7, 0))} disabled={dateOffset === 0}
            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none flex-1">
            {dates.map(date => {
              const d = new Date(date + "T12:00:00");
              const isSelected = date === selectedDate;
              return (
                <button key={date} onClick={() => { setSelectedDate(date); setSelectedSlot(null); }}
                  className={`flex-shrink-0 flex flex-col items-center px-2 py-2 rounded-lg border text-xs w-[2.6rem] transition-colors ${
                    isSelected
                      ? 'bg-green-600 text-white border-green-600'
                      : 'border-gray-200 text-gray-700 bg-white hover:border-green-400'
                  }`}>
                  <span className="font-medium">{DAY_NAMES[d.getDay()]}</span>
                  <span className="text-sm font-bold mt-0.5">{d.getDate()}</span>
                </button>
              );
            })}
          </div>
          <button onClick={() => setDateOffset(p => p + 7)}
            className="p-1 rounded hover:bg-gray-100">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Court selector */}
      {courts.length > 1 && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">Quadra</label>
          <div className="flex gap-2 flex-wrap">
            {courts.map(c => (
              <button key={c.id} onClick={() => { setSelectedCourtId(c.id); setSelectedSlot(null); }}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                  selectedCourtId === c.id
                    ? 'bg-green-600 text-white border-green-600'
                    : 'border-gray-200 text-gray-600 bg-white hover:border-green-400'
                }`}>
                {c.nome}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {selectedCourt && (
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-2">
            Horários — {selectedCourt.nome}
          </label>
          {availableSlots.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500">Nenhum horário neste dia</p>
            </div>
          ) : (() => {
            const sortedSlots = [...availableSlots].sort();

            // Group slots by hour for visual grouping
            const hourGroups: { hour: string; slots: string[] }[] = [];
            sortedSlots.forEach(slot => {
              const hour = slot.split(":")[0] + ":00";
              const last = hourGroups[hourGroups.length - 1];
              if (last && last.hour === hour) {
                last.slots.push(slot);
              } else {
                hourGroups.push({ hour, slots: [slot] });
              }
            });

            return (
              <div className="space-y-1">
                {hourGroups.map(group => (
                  <div key={group.hour} className="flex items-start gap-2">
                    {/* Hour label */}
                    <span className="w-11 text-xs font-semibold text-gray-500 pt-1.5 shrink-0 font-mono">
                      {group.hour}
                    </span>
                    {/* 15-min cells in a row */}
                    <div className="flex-1 grid grid-cols-4 gap-0.5">
                      {["00", "15", "30", "45"].map(mm => {
                        const slot = group.hour.split(":")[0] + ":" + mm;
                        const exists = group.slots.includes(slot);
                        if (!exists) {
                          return <div key={mm} className="h-8 rounded bg-gray-50" />;
                        }
                        const isOccupied = occupiedSet.has(slot);
                        const isSelected = selectedSlot === slot;
                        const conflict = !isOccupied && wouldConflict(slot);

                        if (isOccupied) {
                          return (
                            <div key={mm} className="h-8 rounded relative overflow-hidden" title="Ocupado">
                              <div className="absolute inset-0" style={{
                                background: "repeating-linear-gradient(45deg, #f9fafb, #f9fafb 3px, #f3f4f6 3px, #f3f4f6 6px)",
                              }} />
                            </div>
                          );
                        }

                        return (
                          <button key={mm} type="button"
                            onClick={() => setSelectedSlot(slot)}
                            disabled={conflict}
                            className={`h-8 rounded text-[11px] font-medium transition-all ${
                              isSelected
                                ? "bg-green-600 text-white ring-2 ring-green-300"
                                : conflict
                                  ? "bg-gray-50 text-gray-300 cursor-not-allowed"
                                  : "bg-white border border-gray-200 text-gray-600 hover:border-green-400 hover:bg-green-50"
                            }`}>
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Booking Card — appears when slot is selected */}
      {selectedSlot !== null && selectedCourt && (
        <div className="bg-white rounded-xl border-2 border-green-200 p-4 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-gray-800">Agendar horário</h4>
            <button onClick={() => setSelectedSlot(null)} className="p-1 text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1"><Clock className="w-4 h-4 text-green-600" /> {selectedSlot}</span>
            <span className="flex items-center gap-1"><MapPin className="w-4 h-4 text-green-600" /> {selectedCourt.nome}</span>
          </div>
          <div className="text-xs text-gray-500">{selectedDateLabel}</div>

          {/* Duration pills */}
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Duração</label>
            <div className="flex flex-wrap gap-1.5">
              {duracaoOptions.map(o => (
                <button key={o.value} onClick={() => setSelectedDuracao(o.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    selectedDuracao === o.value
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Conflict warning */}
          {selectedConflict && (
            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
              <Clock className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <span className="text-xs text-amber-700">
                A duração selecionada conflita com um horário já reservado. Tente uma duração menor.
              </span>
            </div>
          )}

          {/* WhatsApp button */}
          {!selectedConflict && quadra.telefone && (
            <a href={buildWhatsAppUrl(quadra.telefone, selectedCourt.nome, selectedDate, selectedSlot, selectedDuracao)}
              target="_blank" rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white py-3 text-sm font-semibold rounded-lg transition-colors">
              <MessageCircle className="w-5 h-5" />
              Reservar via WhatsApp
            </a>
          )}
          {!selectedConflict && !quadra.telefone && (
            <p className="text-sm text-gray-400 text-center">Entre em contato com a arena para reservar</p>
          )}
        </div>
      )}
    </div>
  );
}

const QuadraMap = dynamic(
  () => import('@/components/quadra-map').then(m => m.QuadraMap),
  { ssr: false, loading: () => <div className="h-64 bg-gray-200 rounded-lg flex items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#6AB945]" /></div> }
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
      className="absolute bottom-4 right-4 flex items-center gap-2 bg-white text-gray-800 text-sm font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all border border-gray-200 z-10"
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando quadra...</p>
        </div>
      </div>
    );
  }

  if (notFoundState || !quadra) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Quadra não encontrada</h1>
          <Link href="/quadras" className="text-[#6AB945] hover:underline">Voltar para a busca</Link>
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

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4">
            <Link href="/quadras" className="inline-flex items-center text-[#6AB945] hover:text-[#5aa835]">
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
            <h1 className="text-3xl font-bold">{quadra.nome}</h1>
            <div className="flex items-center gap-3 mt-1 text-gray-600 flex-wrap">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="font-semibold text-gray-800">{quadra.avaliacao}</span>
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
              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4">Sobre esta quadra</h2>
                <p className="text-gray-700 leading-relaxed">{quadra.descricao}</p>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4">Informações</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Users className="w-5 h-5 mr-3 mt-0.5 text-[#6AB945]" />
                    <div>
                      <p className="font-medium">Esporte</p>
                      <p className="text-gray-600">
                        {quadra.tipoPiso === 'futebol' ? '⚽ Futebol'
                          : quadra.tipoPiso === 'tenis' ? '🎾 Tênis'
                          : quadra.tipoPiso === 'areia' ? '🏖️ Areia'
                          : quadra.tipoPiso}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="w-5 h-5 mr-3 mt-0.5 text-[#6AB945]" />
                    <div>
                      <p className="font-medium">Localização</p>
                      <p className="text-gray-600">{quadra.endereco.cidade}, {quadra.endereco.estado}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 border">
                <h2 className="text-xl font-semibold mb-4">Localização</h2>
                <div className="h-64 rounded-lg overflow-hidden">
                  <QuadraMap lat={quadra.coordenadas.lat} lng={quadra.coordenadas.lng} nome={quadra.nome} />
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-center gap-1">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {quadra.endereco.rua}, {quadra.endereco.cidade} — {quadra.endereco.estado}{quadra.endereco.cep ? `, ${quadra.endereco.cep}` : ''}
                </p>
              </div>
            </div>

            {/* Sidebar - reserva */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 border sticky top-24">

                {/* Price + phone — always visible */}
                <div className="mb-6">
                  <div className="flex items-baseline mb-4">
                    {quadra.modalidade === 'publica' ? (
                      <span className="text-2xl font-bold text-[#6AB945]">Gratuita</span>
                    ) : quadra.modalidade === 'clube' ? (
                      <span className="text-2xl font-bold text-gray-700">Sócio</span>
                    ) : quadra.precoPorHora != null ? (
                      <><span className="text-3xl font-bold">R$ {quadra.precoPorHora.toFixed(2)}</span><span className="text-gray-500 ml-2">/hora</span></>
                    ) : (
                      <span className="text-xl font-semibold text-gray-500">Consulte o preço</span>
                    )}
                  </div>
                  {quadra.telefone && (
                    <a href={`tel:${quadra.telefone}`} className="flex items-center gap-2 text-sm text-[#6AB945] hover:underline">
                      <Phone className="w-4 h-4" />{quadra.telefone}
                    </a>
                  )}
                </div>

                {/* ALUGUEL — availability or locked */}
                {quadra.modalidade === 'aluguel' && quadra.mostrarDisponibilidade && (quadra.quadrasInternas?.length ?? 0) > 0 && (
                  <AvailabilitySidebar quadra={quadra} />
                )}

                {quadra.modalidade === 'aluguel' && !quadra.mostrarDisponibilidade && (
                  <>
                    {quadra.telefone && (
                      <a href={`https://wa.me/${quadra.telefone.replace(/\D/g, "").replace(/^(?!55)/, "55")}?text=${encodeURIComponent("Olá! Gostaria de saber sobre horários disponíveis.")}`}
                        target="_blank" rel="noopener noreferrer"
                        className="w-full flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fb855] text-white py-3.5 text-base font-semibold rounded-lg transition-colors mb-3">
                        <MessageCircle className="w-5 h-5" />
                        Consultar horários via WhatsApp
                      </a>
                    )}
                    <p className="text-center text-sm text-gray-500 font-medium">
                      Quadra ainda não integrada
                    </p>
                    <p className="text-center text-xs text-gray-400 mt-1">
                      Entre em contato para verificar disponibilidade
                    </p>

                    {quadra.precoPorHora != null && (
                      <div className="mt-6 pt-6 border-t">
                        <div className="flex justify-between mb-2">
                          <span className="text-gray-600">Consulte o preço</span>
                          <span>—</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg mt-4">
                          <span>Total</span>
                          <span>—</span>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* PÚBLICA */}
                {quadra.modalidade === 'publica' && (
                  <div className="rounded-lg bg-green-50 border border-green-200 p-4 text-sm text-green-800">
                    🏟️ Esta é uma quadra pública de acesso gratuito. Entre em contato ou visite o local para mais informações.
                  </div>
                )}

                {/* CLUBE */}
                {quadra.modalidade === 'clube' && (
                  <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-800">
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
