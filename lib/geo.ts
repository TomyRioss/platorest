export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number } | null> {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(address)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": "PlatoRest MVP (contact: admin@platorest.com)" },
  });
  if (!res.ok) return null;
  const results = (await res.json()) as { lat: string; lon: string }[];
  if (results.length === 0) return null;
  return { lat: parseFloat(results[0].lat), lng: parseFloat(results[0].lon) };
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  const url = `https://photon.komoot.io/reverse?lon=${lng}&lat=${lat}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = (await res.json()) as {
    features: {
      properties: { name?: string; housenumber?: string; street?: string; city?: string; state?: string; country?: string };
    }[];
  };
  const p = data.features[0]?.properties;
  if (!p) return null;
  const label = p.street ? `${p.street}${p.housenumber ? " " + p.housenumber : ""}` : (p.name ?? "");
  const detail = [p.city, p.state, p.country].filter(Boolean).join(", ");
  return [label, detail].filter(Boolean).join(", ");
}

export function haversineKm(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
