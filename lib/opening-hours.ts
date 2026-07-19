type OpeningHour = { dayOfWeek: number; openTime: string; closeTime: string };

function toMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function getOpenStatus(hours: OpeningHour[], now = new Date()): { isOpen: boolean; time: string } | null {
  if (hours.length === 0) return null;

  const day = now.getDay();
  const minutes = now.getHours() * 60 + now.getMinutes();

  const today = hours.filter((h) => h.dayOfWeek === day).sort((a, b) => toMinutes(a.openTime) - toMinutes(b.openTime));

  const activeSlot = today.find((h) => minutes >= toMinutes(h.openTime) && minutes < toMinutes(h.closeTime));
  if (activeSlot) return { isOpen: true, time: activeSlot.closeTime };

  const nextToday = today.find((h) => toMinutes(h.openTime) > minutes);
  if (nextToday) return { isOpen: false, time: nextToday.openTime };

  for (let i = 1; i <= 7; i++) {
    const nextDay = (day + i) % 7;
    const slots = hours.filter((h) => h.dayOfWeek === nextDay).sort((a, b) => toMinutes(a.openTime) - toMinutes(b.openTime));
    if (slots.length > 0) return { isOpen: false, time: slots[0].openTime };
  }

  return null;
}
