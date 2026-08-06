import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMoney(value: number | string): string {
  return Number(value).toLocaleString("es-AR", { maximumFractionDigits: 0 })
}
