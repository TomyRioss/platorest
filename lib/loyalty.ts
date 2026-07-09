// ponytail: arbitrary simple rule for MVP demo — 1 point per $100 spent, floor
export function pointsForTotal(total: number): number {
  return Math.floor(total / 100);
}
