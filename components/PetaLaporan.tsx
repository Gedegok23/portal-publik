"use client";

import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";
import { KATEGORI_CONFIG, STATUS_CONFIG, CITY_CENTER } from "@/lib/constants";
import type { LaporanMapPoint } from "@/lib/types";

export function PetaLaporan({ points }: { points: LaporanMapPoint[] }) {
  return (
    <MapContainer
      center={CITY_CENTER}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((p) => (
        <CircleMarker
          key={p.id}
          center={[p.lat, p.lng]}
          radius={9}
          pathOptions={{
            color: KATEGORI_CONFIG[p.kategori].hex,
            fillColor: KATEGORI_CONFIG[p.kategori].hex,
            fillOpacity: 0.85,
            weight: 2,
          }}
        >
          <Popup>
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                {KATEGORI_CONFIG[p.kategori].icon} {KATEGORI_CONFIG[p.kategori].label}
              </p>
              <p>{p.ringkasan}</p>
              <p className="text-gray-500">{STATUS_CONFIG[p.status].label}</p>
              <Link href={`/laporan/${p.id}`} className="font-medium text-primary underline">
                Lihat detail
              </Link>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
