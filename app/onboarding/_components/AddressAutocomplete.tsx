"use client";

import { useEffect, useRef, useState } from "react";
import { HiMapPin } from "react-icons/hi2";

type Suggestion = {
  label: string;
  detail: string;
  lat: number;
  lng: number;
};

export default function AddressAutocomplete({
  value,
  onChange,
}: {
  value: string;
  onChange: (address: string, coords: { lat: number; lng: number } | null) => void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleInput(text: string) {
    onChange(text, null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (text.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://photon.komoot.io/api/?q=${encodeURIComponent(text)}&limit=5&lang=default&bbox=-73.6,-55.1,-53.6,-21.8`,
        );
        if (!res.ok) throw new Error(`Photon ${res.status}`);
        const data = (await res.json()) as {
          features: {
            geometry: { coordinates: [number, number] };
            properties: {
              name?: string;
              housenumber?: string;
              street?: string;
              city?: string;
              state?: string;
              country?: string;
            };
          }[];
        };
        const items: Suggestion[] = data.features.map((f) => {
          const p = f.properties;
          const label = p.street
            ? `${p.street}${p.housenumber ? " " + p.housenumber : ""}`
            : (p.name ?? "");
          const detail = [p.city, p.state, p.country].filter(Boolean).join(", ");
          return {
            label,
            detail,
            lat: f.geometry.coordinates[1],
            lng: f.geometry.coordinates[0],
          };
        });
        setSuggestions(items);
        setOpen(items.length > 0);
      } catch (err) {
        console.error("Error buscando dirección:", err);
        setSuggestions([]);
        setOpen(false);
      }
    }, 350);
  }

  function selectSuggestion(s: Suggestion) {
    onChange(`${s.label}, ${s.detail}`, { lat: s.lat, lng: s.lng });
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      <HiMapPin className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
      <input
        id="address"
        type="text"
        value={value}
        onChange={(e) => handleInput(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        placeholder="Av. Corrientes 1234, Buenos Aires"
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-background py-2.5 pl-10 pr-3 text-text-primary outline-none transition focus:border-primary"
      />
      {open && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border bg-background shadow-lg">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => selectSuggestion(s)}
                className="flex w-full items-baseline gap-2 border-b border-border px-3 py-2.5 text-left transition last:border-b-0 hover:bg-primary/5"
              >
                <HiMapPin className="h-4 w-4 flex-shrink-0 self-center text-text-secondary" />
                <span className="text-sm font-semibold text-text-primary">{s.label}</span>
                <span className="truncate text-xs text-text-secondary">{s.detail}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
