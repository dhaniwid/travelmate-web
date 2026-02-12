import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Fungsi bawaan shadcn
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- FUNGSI BARU UNTUK FORMAT RUPIAH ---
export function formatMoney(amount: number | string | undefined | null): string {
  if (!amount) return "IDR 0"; // Handle null/0/undefined

  // Jika input string (misal: "1500000"), ubah ke number dulu
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;

  // Cek jika hasil parse bukan angka valid
  if (isNaN(num)) return "IDR 0";

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// --- STANDARD DATE FORMATTER (DD MMM YYYY) ---
export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return "";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(d);
}