"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

function createPin() {
  return L.divIcon({
    className: '',
    html: `<div style="
      width:36px;
      height:36px;
      background:#6AB945;
      border:3px solid #fff;
      border-radius:50% 50% 50% 0;
      transform:rotate(-45deg) translateX(-50%);
      box-shadow:0 3px 10px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
  });
}

function RecenterMap({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng]);
  }, [map, lat, lng]);
  return null;
}

interface QuadraMapProps {
  lat: number;
  lng: number;
  nome: string;
}

export function QuadraMap({ lat, lng, nome }: QuadraMapProps) {
  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      <RecenterMap lat={lat} lng={lng} />
      <Marker
        position={[lat, lng]}
        icon={createPin()}
        title={nome}
      />
    </MapContainer>
  );
}
