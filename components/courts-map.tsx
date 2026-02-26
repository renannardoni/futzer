"use client";

import { useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import { Court } from "@/types/court";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function createPinIcon(isActive: boolean) {
  const bg = isActive ? '#6AB945' : '#1a1a1a';
  const size = isActive ? 16 : 12;
  return L.divIcon({
    className: '',
    html: `<div style="
      width:${size}px;
      height:${size}px;
      background:${bg};
      border-radius:50%;
      border:2px solid #fff;
      box-shadow:0 2px 6px rgba(0,0,0,0.35);
      transform:translate(-50%,-50%);
      transition:all 0.15s;
    "></div>`,
    iconAnchor: [0, 0],
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
  const handleMapClick = useCallback(() => onCourtClick?.(null), [onCourtClick]);

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
              icon={createPinIcon(isActive)}
              eventHandlers={{ click: (e) => { e.originalEvent.stopPropagation(); onCourtClick?.(court); } }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
