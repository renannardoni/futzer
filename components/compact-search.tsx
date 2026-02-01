"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface CompactSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedType: string;
  onTypeChange: (value: string) => void;
}

export function CompactSearch({
  searchTerm,
  onSearchChange,
  selectedType,
  onTypeChange,
}: CompactSearchProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-4 items-center">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar quadras em São Paulo..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <select 
            value={selectedType} 
            onChange={(e) => onTypeChange(e.target.value)}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-[#6AB945] focus:border-transparent"
          >
            <option value="todos">Todos os tipos</option>
            <option value="society">Society</option>
            <option value="grama">Grama Natural</option>
            <option value="salao">Salão</option>
          </select>
        </div>
      </div>
    </div>
  );
}
