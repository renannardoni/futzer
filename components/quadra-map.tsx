"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

interface QuadraMapProps {
  lat: number;
  lng: number;
  nome: string;
}

// ─── Google Maps (Embed API iframe) ──────────────────────────────────────────
function QuadraMapGoogle({ lat, lng, nome }: QuadraMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY!;
  const src = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${lat},${lng}&zoom=15&maptype=roadmap&language=pt-BR`;

  return (
    <iframe
      src={src}
      width="100%"
      height="100%"
      style={{ border: 0 }}
      allowFullScreen
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      title={`Mapa - ${nome}`}
    />
  );
}

// ─── OpenStreetMap fallback (no key needed) ───────────────────────────────────
function createPin() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;height:36px;background:#6AB945;border:3px solid #fff;
      border-radius:50% 50% 50% 0;transform:rotate(-45deg) translateX(-50%);
      box-shadow:0 3px 10px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.setView([lat, lng]); }, [map, lat, lng]);
  return null;
}

function QuadraMapOSM({ lat, lng, nome }: QuadraMapProps) {
  return (
    <MapContainer center={[lat, lng]} zoom={15} style={{ height: "100%", width: "100%" }} scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <RecenterMap lat={lat} lng={lng} />
      <Marker position={[lat, lng]} icon={createPin()} title={nome} />
    </MapContainer>
  );
}

// ─── Export: Google Maps if key present, OSM otherwise ───────────────────────
export function QuadraMap(props: QuadraMapProps) {
  if (process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY) {
    return <QuadraMapGoogle {...props} />;
  }
  return <QuadraMapOSM {...props} />;
}
