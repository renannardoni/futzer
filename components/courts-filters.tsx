"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search, SlidersHorizontal } from "lucide-react";

interface CourtsFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

export function CourtsFilters({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
}: CourtsFiltersProps) {
  return (
    <div className="mb-8 space-y-4">
      <div className="flex items-center gap-2">
        <SlidersHorizontal className="h-5 w-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Filtros</h2>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar por nome da quadra..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        
        <Select
          value={selectedType}
          onChange={(e) => onTypeChange(e.target.value)}
        >
          <option value="todos">Todos os esportes</option>
          <option value="futebol">⚽ Futebol</option>
          <option value="tenis">🎾 Tênis</option>
        </Select>
      </div>
    </div>
  );
}
