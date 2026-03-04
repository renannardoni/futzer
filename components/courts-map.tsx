"use client";

import { useCallback, useEffect } from "react";
import { APIProvider, Map, useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Court } from "@/types/court";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const MAP_ID = "7d48a8d3e0d52541babf3db1";

function createPinHtml(tipoPiso: string | undefined, isActive: boolean) {
  const bg = isActive ? '#6AB945' : '#2d2d2d';
  const w = isActive ? 38 : 30;
  const h = isActive ? 50 : 40;
  const r = isActive ? 19 : 15;
  const emoji = tipoPiso === 'tenis' ? '🎾' : tipoPiso === 'areia' ? '🏖️' : '⚽';
  const fontSize = isActive ? 15 : 12;
  const cx = w / 2;
  const cy = r;
  return `<div style="filter:drop-shadow(0 3px 6px rgba(0,0,0,0.3));cursor:pointer;"><svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg"><path d="M${cx} ${h-2} C${cx} ${h-2} 2 ${cy+10} 2 ${cy} a${r-2} ${r-2} 0 1 1 ${w-4} 0 C${w-2} ${cy+10} ${cx} ${h-2} ${cx} ${h-2}Z" fill="${bg}" stroke="#fff" stroke-width="2"/><text x="${cx}" y="${cy+1}" text-anchor="middle" dominant-baseline="central" font-size="${fontSize}">${emoji}</text></svg></div>`;
}

function MapClickHandler({ onMapClick }: { onMapClick: () => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map) return;
    const listener = map.addListener('click', onMapClick);
    return () => listener.remove();
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

function MapInner({ courts, hoveredCourtId, selectedCourtId, onCourtClick, userLat, userLng, cityCenter }: CourtsMapProps) {
  const handleMapClick = useCallback(() => onCourtClick?.(null), [onCourtClick]);

  const defaultCenter = userLat != null && userLng != null
    ? { lat: userLat, lng: userLng }
    : cityCenter ? { lat: cityCenter[0], lng: cityCenter[1] } : { lat: -22.9056, lng: -47.0608 };

  return (
    <Map
      key={`${defaultCenter.lat},${defaultCenter.lng}`}
      defaultCenter={defaultCenter}
      defaultZoom={13}
      gestureHandling="greedy"
      mapId={MAP_ID}
      style={{ height: "100%", width: "100%" }}
    >
      <MapClickHandler onMapClick={handleMapClick} />
      {userLat != null && userLng != null && (
        <AdvancedMarker position={{ lat: userLat, lng: userLng }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:'#4285F4', border:'3px solid #fff', boxShadow:'0 2px 6px rgba(0,0,0,0.3)' }} />
        </AdvancedMarker>
      )}
      {courts.map((court) => {
        const isActive = selectedCourtId === court.id || hoveredCourtId === court.id;
        return (
          <AdvancedMarker
            key={court.id}
            position={{ lat: court.coordenadas.lat, lng: court.coordenadas.lng }}
            onClick={(e) => { e.stop(); onCourtClick?.(court); }}
          >
            <div dangerouslySetInnerHTML={{ __html: createPinHtml(court.tipoPiso, isActive) }} />
          </AdvancedMarker>
        );
      })}
    </Map>
  );
}

export function CourtsMap(props: CourtsMapProps) {
  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="h-full w-full">
        <MapInner {...props} />
      </div>
    </APIProvider>
  );
}
