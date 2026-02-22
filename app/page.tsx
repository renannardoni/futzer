"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Header } from "@/components/header";
import { CourtCard } from "@/components/court-card";
import { getQuadras, type Quadra } from "@/lib/api";
import { Star, MapPin, X, ChevronRight } from "lucide-react";

const CourtsMap = dynamic(() => import("@/components/courts-map").then(mod => ({ default: mod.CourtsMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted flex items-center justify-center">
      <p className="text-muted-foreground">Carregando mapa...</p>
    </div>
  ),
});

const FALLBACK = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=400&h=300&fit=crop";

function getImg(url?: string) {
  if (!url || url.includes('example.com') || url.includes('placeholder.com') || url.includes('via.placeholder')) return FALLBACK;
  return url;
}

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("todos");
  const [hoveredCourtId, setHoveredCourtId] = useState<string | null>(null);
  const [selectedCourt, setSelectedCourt] = useState<Quadra | null>(null);
  const [courts, setCourts] = useState<Quadra[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQuadras()
      .then(setCourts)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredCourts = useMemo(() => {
    return courts.filter((court) => {
      const matchesSearch = court.nome.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedType === "todos" || court.tipoPiso === selectedType;
      return matchesSearch && matchesType;
    });
  }, [courts, searchTerm, selectedType]);

  const courtList = (
    <>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600" />
          <p className="mt-4 text-muted-foreground">Carregando quadras...</p>
        </div>
      ) : filteredCourts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-lg text-muted-foreground">Nenhuma quadra encontrada.</p>
          <button onClick={() => { setSearchTerm(""); setSelectedType("todos"); }} className="mt-4 text-primary hover:underline text-sm">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground dark:text-gray-400">
            {filteredCourts.length} {filteredCourts.length === 1 ? "quadra" : "quadras"} em São Paulo
          </p>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {filteredCourts.map((court) => (
              <CourtCard
                key={court.id}
                court={court}
                onMouseEnter={() => setHoveredCourtId(court.id)}
                onMouseLeave={() => setHoveredCourtId(null)}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />

      {/* ── MOBILE layout ──────────────────────────────────── */}
      <div className="lg:hidden flex flex-col">
        {/* Map */}
        <div className="relative h-[55vh]">
          <CourtsMap
            courts={filteredCourts}
            selectedCourtId={selectedCourt?.id}
            onCourtClick={setSelectedCourt}
          />

          {/* Bottom preview card when marker is tapped */}
          {selectedCourt && (
            <div className="absolute bottom-4 left-3 right-3 z-[1000] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex">
              <div className="w-28 shrink-0">
                <img
                  src={getImg(selectedCourt.imagemCapa)}
                  alt={selectedCourt.nome}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-3 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedCourt.nome}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />{selectedCourt.endereco.rua}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div>
                    <span className="text-sm font-bold text-gray-900 dark:text-white">
                      {selectedCourt.precoPorHora != null ? `R$ ${selectedCourt.precoPorHora.toFixed(0)}` : 'Consulte'}
                    </span>
                    {selectedCourt.precoPorHora != null && <span className="text-xs text-gray-400">/hora</span>}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{selectedCourt.avaliacao}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end p-2">
                <button
                  onClick={() => setSelectedCourt(null)}
                  className="p-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <Link
                  href={`/quadras/${selectedCourt.id}`}
                  className="flex items-center gap-0.5 text-xs font-semibold text-[#6AB945]"
                >
                  Ver <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Drag handle hint */}
        <div className="flex justify-center py-2 bg-white dark:bg-gray-900">
          <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
        </div>

        {/* List */}
        <div className="px-4 pb-8 pt-2 dark:bg-gray-900">
          {courtList}
        </div>
      </div>

      {/* ── DESKTOP layout ─────────────────────────────────── */}
      <main className="hidden lg:grid lg:grid-cols-2 h-[calc(100vh-96px)]">
        <div className="overflow-y-auto px-6 py-6 dark:bg-gray-900">
          {courtList}
        </div>
        <div className="relative h-full sticky top-0">
          <CourtsMap
            courts={filteredCourts}
            hoveredCourtId={hoveredCourtId}
            selectedCourtId={selectedCourt?.id}
            onCourtClick={setSelectedCourt}
          />

          {/* Bottom preview card when marker is clicked */}
          {selectedCourt && (
            <div className="absolute bottom-5 left-4 right-4 z-[1000] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex">
              <div className="w-32 shrink-0">
                <img
                  src={getImg(selectedCourt.imagemCapa)}
                  alt={selectedCourt.nome}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 p-4 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{selectedCourt.nome}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1 truncate">
                  <MapPin className="w-3 h-3 shrink-0" />{selectedCourt.endereco.rua}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div>
                    <span className="text-base font-bold text-gray-900 dark:text-white">
                      {selectedCourt.precoPorHora != null ? `R$ ${selectedCourt.precoPorHora.toFixed(0)}` : 'Consulte'}
                    </span>
                    {selectedCourt.precoPorHora != null && <span className="text-xs text-gray-400">/hora</span>}
                  </div>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{selectedCourt.avaliacao}</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-between items-end p-3">
                <button
                  onClick={() => setSelectedCourt(null)}
                  className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                <Link
                  href={`/quadras/${selectedCourt.id}`}
                  className="flex items-center gap-0.5 text-sm font-semibold text-[#6AB945] hover:underline"
                >
                  Ver <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
