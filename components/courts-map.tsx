"use client";

import { useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, CircleMarker, useMap } from "react-leaflet";
import { Court } from "@/types/court";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function createPinIcon(tipoPiso: string | undefined, isActive: boolean) {
  const bg = isActive ? '#6AB945' : '#2d2d2d';
  const stroke = '#fff';
  const w = isActive ? 38 : 30;
  const h = isActive ? 50 : 40;
  const r = isActive ? 19 : 15;
  const emoji = tipoPiso === 'tenis' ? '🎾' : tipoPiso === 'areia' ? '🏖️' : '⚽';
  const fontSize = isActive ? 15 : 12;
  const cx = w / 2;
  const cy = r;
  return L.divIcon({
    className: '',
    html: `
      <div style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3)); transition:all 0.15s;">
        <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
          <path d="M${cx} ${h - 2} C${cx} ${h - 2} 2 ${cy + 10} 2 ${cy} a${r - 2} ${r - 2} 0 1 1 ${w - 4} 0 C${w - 2} ${cy + 10} ${cx} ${h - 2} ${cx} ${h - 2}Z"
            fill="${bg}" stroke="${stroke}" stroke-width="2"/>
          <text x="${cx}" y="${cy + 1}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}">${emoji}</text>
        </svg>
      </div>`,
    iconAnchor: [w / 2, h],
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
  userLat?: number | null;
  userLng?: number | null;
  cityCenter?: [number, number];
}

export function CourtsMap({ courts, hoveredCourtId, selectedCourtId, onCourtClick, userLat, userLng, cityCenter }: CourtsMapProps) {
  const handleMapClick = useCallback(() => onCourtClick?.(null), [onCourtClick]);

  const center: [number, number] =
    userLat != null && userLng != null
      ? [userLat, userLng]
      : cityCenter ?? [-23.5505, -46.6333];

  // key forces remount when city changes so center updates
  const mapKey = `${center[0].toFixed(4)},${center[1].toFixed(4)}`;

  return (
    <div className="h-full w-full">
      <MapContainer key={mapKey} center={center} zoom={13} style={{ height: "100%", width: "100%" }} scrollWheelZoom={true}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapClickHandler onMapClick={handleMapClick} />

        {userLat != null && userLng != null && (
          <CircleMarker
            center={[userLat, userLng]}
            radius={10}
            pathOptions={{ color: '#fff', weight: 3, fillColor: '#4285F4', fillOpacity: 1 }}
          />
        )}

        {courts.map((court) => {
          const isActive = selectedCourtId === court.id || hoveredCourtId === court.id;
          return (
            <Marker
              key={court.id}
              position={[court.coordenadas.lat, court.coordenadas.lng]}
              icon={createPinIcon(court.tipoPiso, isActive)}
              eventHandlers={{ click: (e) => { e.originalEvent.stopPropagation(); onCourtClick?.(court); } }}
            />
          );
        })}
      </MapContainer>
    </div>
  );
}
