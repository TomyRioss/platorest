"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import type { Map as LeafletMap } from "leaflet";
import L from "leaflet";
import { HiMapPin } from "react-icons/hi2";

const markerIcon = L.divIcon({
  html: `<div class="h-7 w-7 rotate-45 rounded-full rounded-bl-none bg-primary border-2 border-white shadow-md"></div>`,
  className: "",
  iconSize: [28, 28],
  iconAnchor: [14, 28],
});

type Branch = { id: string; name: string; address: string | null; lat: number | null; lng: number | null };
type GeoBranch = Branch & { lat: number; lng: number };

function FlyTo({ target }: { target: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 16, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export function BranchesMap({ branches, title }: { branches: Branch[]; title?: string }) {
  const [focused, setFocused] = useState<string | null>(null);
  const mapRef = useRef<LeafletMap | null>(null);

  if (branches.length === 0) return null;

  const geoBranches = branches.filter((b): b is GeoBranch => b.lat != null && b.lng != null);
  const focusedBranch = geoBranches.find((b) => b.id === focused);

  return (
    <div className={geoBranches.length > 0 ? "grid h-full grid-cols-1 gap-2 md:grid-cols-[3fr_2fr]" : ""}>
      {geoBranches.length > 0 && (
        <div className="h-80 w-full overflow-hidden rounded-xl border border-border md:h-full">
          <MapContainer center={[geoBranches[0].lat, geoBranches[0].lng]} zoom={13} className="h-full w-full" ref={mapRef}>
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <FlyTo target={focusedBranch ? [focusedBranch.lat, focusedBranch.lng] : null} />
            {geoBranches.map((b) => (
              <Marker key={b.id} position={[b.lat, b.lng]} icon={markerIcon} eventHandlers={{ click: () => setFocused(b.id) }}>
                <Popup>{b.name}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
      <div className="flex h-full flex-col gap-4">
      {title && <h1 className="text-lg font-bold text-text-primary">{title}</h1>}
      <ul className="flex flex-col gap-2">
        {branches.map((b) => {
          const hasGeo = b.lat != null && b.lng != null;
          return (
            <li key={b.id}>
              <button
                type="button"
                onClick={() => hasGeo && setFocused(b.id)}
                disabled={!hasGeo}
                className={`flex w-full items-start gap-2 rounded-lg border px-3 py-2.5 text-left transition ${
                  focused === b.id ? "border-primary bg-primary-light" : "border-border bg-background hover:bg-surface"
                } ${!hasGeo ? "cursor-default" : ""}`}
              >
                <HiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  <span className="block text-sm font-semibold text-text-primary">{b.name}</span>
                  {b.address ? (
                    <span className="block text-xs text-text-secondary">{b.address}</span>
                  ) : (
                    <span className="block text-xs text-text-secondary">Sin dirección cargada</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      </div>
    </div>
  );
}
