// ponytail: !3d!4d (pinned place) takes priority over @lat,lng (viewport center, can be the user's live location)
// and ?q=lat,lng. Short goo.gl links aren't resolved (need a fetch/redirect).
export function parseGoogleMapsLink(url: string): { lat: number; lng: number } | null {
  const match =
    url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/) ??
    url.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/) ??
    url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (!match) return null;
  const lat = Number(match[1]);
  const lng = Number(match[2]);
  if (Number.isNaN(lat) || Number.isNaN(lng)) return null;
  return { lat, lng };
}
