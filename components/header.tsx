"use client";

import Image from "next/image";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Search, MapPin } from "lucide-react";

export const CITIES = [
  { value: "sao-paulo", label: "São Paulo",  short: "SP" },
  { value: "campinas",  label: "Campinas",   short: "CPS" },
];

interface HeaderProps {
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  selectedType?: string;
  onTypeChange?: (value: string) => void;
  selectedCity?: string;
  onCityChange?: (value: string) => void;
}

export function Header({
  searchTerm = "",
  onSearchChange,
  selectedType = "todos",
  onTypeChange,
  selectedCity = "sao-paulo",
  onCityChange,
}: HeaderProps) {
  const borderColor = selectedType === "tenis" ? "#C26B3A" : selectedType === "areia" ? "#D4962A" : "#6AB945";

  const opts = [
    { value: "todos",   short: "Todos", long: "Todos"      },
    { value: "futebol", short: "⚽",    long: "⚽ Futebol" },
    { value: "tenis",   short: "🎾",    long: "🎾 Tênis"  },
    { value: "areia",   short: "🏖️",    long: "🏖️ Areia"  },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-700 shadow-sm">
      <div className="w-full flex h-20 lg:h-24 items-center justify-between gap-3 lg:gap-6 px-3 lg:px-6 py-2 lg:py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/logo.png"
            alt="Futzer Logo"
            width={80}
            height={80}
            priority
            unoptimized
            className="w-12 h-12 lg:w-[80px] lg:h-[80px]"
          />
          <span className="hidden lg:block text-4xl font-bold" style={{ color: '#6AB945' }}>futzer</span>
        </Link>

        {/* Search + city + filtro centralizado */}
        <div className="flex-1 flex justify-center min-w-0">
          <div className="flex gap-2 lg:gap-3 w-full max-w-3xl min-w-0">

            {/* City selector */}
            <div className="relative shrink-0">
              <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#6AB945] pointer-events-none" />
              <select
                value={selectedCity}
                onChange={(e) => onCityChange?.(e.target.value)}
                className="h-10 lg:h-11 pl-7 pr-6 text-xs lg:text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6AB945] focus:border-transparent"
              >
                {CITIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>

            {/* Campo de busca */}
            <div className="flex-1 relative min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar quadras..."
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-9 h-10 lg:h-11 text-sm w-full dark:bg-gray-800 dark:border-gray-600 dark:text-white"
              />
            </div>

            {/* Pill buttons de esporte */}
            <div
              className="flex shrink-0 rounded-xl overflow-hidden shadow-sm border transition-colors duration-300"
              style={{ borderColor }}
            >
              {opts.map((opt, i) => {
                const isActive = selectedType === opt.value;
                const activeStyle = opt.value === "tenis"
                  ? { backgroundColor: "#C26B3A", color: "#fff" }
                  : opt.value === "areia"
                  ? { backgroundColor: "#D4962A", color: "#fff" }
                  : { backgroundColor: "#6AB945", color: "#fff" };
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => onTypeChange?.(opt.value)}
                    style={isActive ? activeStyle : undefined}
                    className={[
                      "relative h-10 lg:h-11 px-3 lg:px-4 text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1",
                      i > 0 ? "border-l border-gray-200 dark:border-gray-700" : "",
                      isActive
                        ? "shadow-inner"
                        : "bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200",
                    ].join(" ")}
                  >
                    <span className="lg:hidden">{opt.short}</span>
                    <span className="hidden lg:inline whitespace-nowrap">{opt.long}</span>
                  </button>
                );
              })}
            </div>

          </div>
        </div>

      </div>
    </header>
  );
}
