import Image from "next/image";
import Link from "next/link";
import { Court } from "@/types/court";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Star } from "lucide-react";

interface CourtCardProps {
  court: Court;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const courtTypeLabels: Record<string, string> = {
  society: "Society",
  grama: "Grama",
  salao: "Salão",
  quadra: "Quadra",
  campo: "Campo",
  areia: "Areia",
};

const courtTypeColors: Record<string, string> = {
  society: "bg-blue-500",
  grama: "bg-green-500",
  salao: "bg-purple-500",
  quadra: "bg-orange-500",
  campo: "bg-emerald-500",
  areia: "bg-yellow-500",
  society: "bg-blue-100 text-blue-800 border-blue-200",
  grama: "bg-green-100 text-green-800 border-green-200",
  salao: "bg-purple-100 text-purple-800 border-purple-200",
};

export function CourtCard({ court, onMouseEnter, onMouseLeave }: CourtCardProps) {
  return (
    <Link href={`/quadras/${court.id}`}>
      <Card 
        className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700"
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        <div className="relative h-48 w-full">
          <Image
            src={court.imagemCapa}
            alt={court.nome}
            fill
            className="object-cover"
          />
          <Badge className="absolute top-3 right-3 bg-white dark:bg-gray-800 text-black dark:text-white hover:bg-white dark:hover:bg-gray-800">
            {courtTypeLabels[court.tipoPiso]}
          </Badge>
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
          <div className="text-lg font-semibold dark:text-white">
            R$ {court.precoPorHora.toFixed(0)}
            <span className="text-sm font-normal text-muted-foreground dark:text-gray-400">/hora</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
