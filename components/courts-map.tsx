"use client";

import { useEffect, useState, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Court } from "@/types/court";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function createPriceIcon(price: number, isActive: boolean) {
  const bg = isActive ? '#6AB945' : '#1a1a1a';
  const scale = isActive ? 'scale(1.15)' : 'scale(1)';
  return L.divIcon({
    className: '',
    html: `<div style="
      display:inline-block;
      background:${bg};
      color:#fff;
      padding:5px 10px;
      border-radius:20px;
      font-size:13px;
      font-weight:700;
      white-space:nowrap;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      border:2px solid #fff;
      transform:translateX(-50%) ${scale};
      transform-origin:bottom center;
      transition:all 0.15s;
    ">R$${Math.round(price)}</div>`,
    iconAnchor: [0, 16],
  });
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();
  useEffect(() => {
    map.on('click', onMapClick);
    return () => { map.off('click', onMapClick); };
  }, [map, onMapClick]);
  return null;
}

interface CourtsMapProps {
  courts: Court[];
  hoveredCourtId?: string | null;
  selectedCourtId?: string | null;
  onCourtClick?: (court: Court | null) => void;
}

export function CourtsMap({ courts, hoveredCourtId, selectedCourtId, onCourtClick }: CourtsMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);

  const handleMapClick = useCallback(() => onCourtClick?.(null), [onCourtClick]);

  if (!isMounted) {
    return (
      <div className="h-full w-full bg-muted rounded-lg flex items-center justify-center">
        <p className="text-muted-foreground">Carregando mapa...</p>
      </div>
    );
  }

  const center: [number, number] = courts.length > 0
    ? [
        courts.reduce((sum, c) => sum + c.coordenadas.lat, 0) / courts.length,
        courts.reduce((sum, c) => sum + c.coordenadas.lng, 0) / courts.length,
      ]
    : [-23.5505, -46.6333];

  return (
    <div className="h-full w-full">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />
        {courts.map((court) => {
          const isActive = selectedCourtId === court.id || hoveredCourtId === court.id;
          return (
            <Marker
              key={court.id}
              position={[court.coordenadas.lat, court.coordenadas.lng]}
              icon={createPriceIcon(court.precoPorHora ?? 0, isActive)}
              eventHandlers={{ click: (e) => { e.originalEvent.stopPropagation(); onCourtClick?.(court); } }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
