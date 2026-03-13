"use client";

import { useCallback, useEffect, useState } from "react";
import { APIProvider, Map, useMap, AdvancedMarker } from "@vis.gl/react-google-maps";
import { Court } from "@/types/court";

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!;
const MAP_ID = "7d48a8d3e0d52541babf3db1";

function createPinHtml(tipoPiso: string | undefined, isActive: boolean, isDark: boolean = false) {
  const bg = isActive ? '#6AB945' : '#2d2d2d';
  const w = isActive ? 30 : 24;
  const h = isActive ? 40 : 32;
  const r = isActive ? 15 : 12;
  const emoji = tipoPiso === 'tenis' ? '🎾' : tipoPiso === 'areia' ? '🏖️' : '⚽';
  const fontSize = isActive ? 12 : 10;
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

function MapCenterWatcher({ onCenterChanged }: { onCenterChanged?: (lat: number, lng: number) => void }) {
  const map = useMap();
  useEffect(() => {
    if (!map || !onCenterChanged) return;
    const listener = map.addListener('idle', () => {
      const center = map.getCenter();
      if (center) onCenterChanged(center.lat(), center.lng());
    });
    return () => listener.remove();
  }, [map, onCenterChanged]);
  return null;
}

interface CourtsMapProps {
  courts: Court[];
  hoveredCourtId?: string | null;
  selectedCourtId?: string | null;
  onCourtClick?: (court: Court | null) => void;
  onCenterChanged?: (lat: number, lng: number) => void;
  userLat?: number | null;
  userLng?: number | null;
  cityCenter?: [number, number];
  isDark?: boolean;
}

function MapInner({ courts, hoveredCourtId, selectedCourtId, onCourtClick, onCenterChanged, userLat, userLng, cityCenter, isDark }: CourtsMapProps) {
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
      <MapCenterWatcher onCenterChanged={onCenterChanged} />
      {userLat != null && userLng != null && (
        <AdvancedMarker position={{ lat: userLat, lng: userLng }}>
          <div style={{ width:20, height:20, borderRadius:'50%', background:'#4285F4', border:'3px solid #fff', boxShadow:'0 2px 6px rgba(0,0,0,0.3)', ...(isDark ? { filter: 'invert(90%) hue-rotate(180deg)' } : {}) }} />
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
            <div dangerouslySetInnerHTML={{ __html: createPinHtml(court.tipoPiso, isActive, isDark) }} style={isDark ? { filter: "invert(90%) hue-rotate(180deg)" } : undefined} />
          </AdvancedMarker>
        );
      })}
    </Map>
  );
}

export function CourtsMap(props: CourtsMapProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const check = () => setIsDark(root.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return (
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
      <div className="h-full w-full relative">
        <div
          className="h-full w-full"
          style={isDark ? { filter: "invert(90%) hue-rotate(180deg) brightness(0.85) contrast(0.9)" } : undefined}
        >
          <MapInner {...props} isDark={isDark} />
        </div>
      </div>
    </APIProvider>
  );
}
