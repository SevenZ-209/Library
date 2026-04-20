import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export type AvailabilityStatus = 'available' | 'limited' | 'unavailable';

export function getAvailabilityStatus(available: number, total: number): AvailabilityStatus {
  if (available === 0) return 'unavailable';
  if (available <= total * 0.2) return 'limited';
  return 'available';
}

export function getImageUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  
  if (url.startsWith('http')) return url;
  
  if (url.startsWith('image/upload')) return `https://res.cloudinary.com/dgpiotsmt/${url}`;

}