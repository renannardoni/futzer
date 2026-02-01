"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Court } from "@/types/court";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom icons for normal and highlighted markers
const defaultIcon = new L.Icon({
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const highlightedIcon = new L.Icon({
  iconUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'%3E%3Cpath fill='%2322C55E' d='M12.5 0C5.596 0 0 5.596 0 12.5c0 1.781.375 3.469 1.047 5l10.984 22.656c.281.563.938.563 1.219 0L24.234 17.5c.672-1.531 1.047-3.219 1.047-5C25.281 5.596 19.685 0 12.781 0h-.281z'/%3E%3Ccircle cx='12.5' cy='12.5' r='5' fill='white'/%3E%3C/svg%3E",
  iconRetinaUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='25' height='41' viewBox='0 0 25 41'%3E%3Cpath fill='%2322C55E' d='M12.5 0C5.596 0 0 5.596 0 12.5c0 1.781.375 3.469 1.047 5l10.984 22.656c.281.563.938.563 1.219 0L24.234 17.5c.672-1.531 1.047-3.219 1.047-5C25.281 5.596 19.685 0 12.781 0h-.281z'/%3E%3Ccircle cx='12.5' cy='12.5' r='5' fill='white'/%3E%3C/svg%3E",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [35, 57],
  iconAnchor: [17, 57],
  popupAnchor: [1, -47],
  shadowSize: [57, 57]
});

interface CourtsMapProps {
  courts: Court[];
  hoveredCourtId?: string | null;
}

export function CourtsMap({ courts, hoveredCourtId }: CourtsMapProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    
    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    
    checkTheme();
    
    // Watch for theme changes
    const observer = new MutationObserver(checkTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"]
    });
    
    return () => observer.disconnect();
  }, []);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  // Calculate center of all courts
  const center: [number, number] = courts.length > 0
    ? [
        courts.reduce((sum, court) => sum + court.coordenadas.lat, 0) / courts.length,
        courts.reduce((sum, court) => sum + court.coordenadas.lng, 0) / courts.length,
      ]
    : [-23.5505, -46.6333]; // São Paulo default

  return (
    <div className="h-full w-full">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={
            isDark
              ? "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
              : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          }
        />
        {courts.map((court) => (
          <Marker
            key={court.id}
            position={[court.coordenadas.lat, court.coordenadas.lng]}
            icon={hoveredCourtId === court.id ? highlightedIcon : defaultIcon}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-semibold text-sm">{court.nome}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  {court.endereco.cidade}, {court.endereco.estado}
                </p>
                <p className="text-sm font-medium mt-2">
                  R$ {court.precoPorHora.toFixed(2)}/hora
                </p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
