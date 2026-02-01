"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/header";
import { CourtCard } from "@/components/court-card";
import { mockCourts } from "@/lib/mock-data";

const CourtsMap = dynamic(() => import("@/components/courts-map").then(mod => ({ default: mod.CourtsMap })), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">Carregando mapa...</p>
    </div>
  ),
});

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("todos");
  const [hoveredCourtId, setHoveredCourtId] = useState<string | null>(null);

  const filteredCourts = useMemo(() => {
    return mockCourts.filter((court) => {
      const matchesSearch = court.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "todos" || court.tipoPiso === selectedType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedType]);

  return (
    <div className="min-h-screen bg-background dark:bg-gray-900">
      <Header 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedType={selectedType}
        onTypeChange={setSelectedType}
      />
      
      <main className="h-[calc(100vh-96px)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full">
          {/* Lista de quadras */}
          <div className="overflow-y-auto px-6 py-6 dark:bg-gray-900">
            {filteredCourts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <p className="text-lg text-muted-foreground">
                  Nenhuma quadra encontrada.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedType("todos");
                  }}
                  className="mt-4 text-primary hover:underline text-sm"
                >
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
          </div>

          {/* Mapa */}
          <div className="hidden lg:block h-full sticky top-0">
            <CourtsMap courts={filteredCourts} hoveredCourtId={hoveredCourtId} />
          </div>
        </div>
      </main>
    </div>
  );
}
