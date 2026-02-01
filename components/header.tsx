import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LogIn, Search } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedType?: string;
  onTypeChange?: (value: string) => void;
}

export function Header({ searchTerm = "", onSearchChange, selectedType = "todos", onTypeChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm">
      <div className="container mx-auto flex h-24 items-center justify-between gap-6 px-6 py-4">
        <div className="flex items-center gap-4">
          <Image 
            src="/logo.png" 
            alt="Futzer Logo" 
            width={80} 
            height={80}
            priority
            unoptimized
            className="-my-4"
          />
          <span className="text-4xl font-bold" style={{ color: '#6AB945' }}>futzer</span>
        </div>
        
        <div className="flex-1 max-w-2xl flex gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar quadras em São Paulo..."
              value={searchTerm}
              onChange={(e) => onSearchChange?.(e.target.value)}
              className="pl-10 h-11 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            />
          </div>
          <select 
            value={selectedType} 
            onChange={(e) => onTypeChange?.(e.target.value)}
            className="pl-4 pr-12 py-2 h-11 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 transition-colors appearance-none bg-no-repeat bg-[length:1.5rem] bg-[right_0.5rem_center]"
            style={{ backgroundImage: "url(\"data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e\")" }}
          >
            <option value="todos">Todos os tipos</option>
            <option value="society">Society</option>
            <option value="grama">Grama Natural</option>
            <option value="salao">Salão</option>
          </select>
        </div>
        
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button className="gap-2 hover:opacity-90" style={{ backgroundColor: '#6AB945' }}>
            <LogIn className="h-4 w-4" />
            <span className="hidden sm:inline">Entrar</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
