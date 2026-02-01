"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
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
          <Select value={selectedType} onValueChange={onTypeChange}>
            <option value="todos">Todos os tipos</option>
            <option value="society">Society</option>
            <option value="grama">Grama Natural</option>
            <option value="salao">Salão</option>
          </Select>
        </div>
      </div>
    </div>
  );
}
