import Image from "next/image";
import Link from "next/link";
import { Court } from "@/types/court";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star, Phone } from "lucide-react";

interface CourtCardProps {
  court: Court;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const courtTypeLabels: Record<string, string> = {
  futebol: "⚽ Futebol",
  tenis: "🎾 Tênis",
  society: "⚽ Futebol",
  grama: "⚽ Futebol",
  salao: "⚽ Futebol",
  quadra: "⚽ Futebol",
  campo: "⚽ Futebol",
  areia: "🏖️ Areia",
};

const modalidadeLabels: Record<string, string> = {
  publica:  "🏟️ Pública",
  clube:    "🏅 Clube",
  aluguel:  "🔑 Aluguel",
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?w=800&h=600&fit=crop";

function getImageSrc(url?: string) {
  if (!url) return FALLBACK_IMAGE;
  if (url.includes("example.com") || url.includes("placeholder.com")) return FALLBACK_IMAGE;
  return url;
}

export function CourtCard({ court, onMouseEnter, onMouseLeave }: CourtCardProps) {
  const isAluguel = court.modalidade === "aluguel";
  const showPrice = isAluguel;

  return (
    <Link href={`/quadras/${court.id}`}>
      <Card
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="relative h-48 w-full">
          <Image
            src={getImageSrc(court.imagemCapa)}
            alt={court.nome}
            fill
            className="object-cover"
            unoptimized={getImageSrc(court.imagemCapa).includes('localhost')}
          />
          {/* Badges empilhados no canto superior direito */}
          <div className="absolute top-3 right-3 flex flex-col items-end gap-1">
            <Badge className="bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-white dark:hover:bg-gray-800">
              {courtTypeLabels[court.tipoPiso] ?? court.tipoPiso}
            </Badge>
            {court.modalidade && (
              <Badge className="bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-white dark:hover:bg-gray-800">
                {modalidadeLabels[court.modalidade] ?? court.modalidade}
              </Badge>
            )}
          </div>
        </div>
        <CardContent className="p-4 dark:bg-gray-800">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-base line-clamp-1 dark:text-white">{court.nome}</h3>
            <div className="flex items-center gap-1 shrink-0">
              <Star className="h-4 w-4 fill-current text-yellow-500" />
              <span className="text-sm font-medium dark:text-gray-200">{court.avaliacao}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-gray-400 mb-3">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{court.endereco.rua}</span>
          </div>
          <div className="flex items-end justify-between gap-2">
            <div className="text-lg font-semibold dark:text-white">
              {showPrice ? (
                court.precoPorHora != null
                  ? <>{"R$ "}{court.precoPorHora.toFixed(0)}<span className="text-sm font-normal text-muted-foreground dark:text-gray-400">/hora</span></>
                  : <span className="text-sm font-normal text-muted-foreground dark:text-gray-400">R$ -,--<span className="ml-0.5">/hora</span></span>
              ) : (
                <span className="text-sm font-normal text-muted-foreground dark:text-gray-400">
                  {court.modalidade === "publica" ? "Gratuita" : court.modalidade === "clube" ? "Sócio" : ""}
                </span>
              )}
            </div>
            {court.telefone && (
              <div className="flex items-center gap-1 text-sm text-muted-foreground dark:text-gray-400">
                <Phone className="h-3.5 w-3.5" />
                <span>{court.telefone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
