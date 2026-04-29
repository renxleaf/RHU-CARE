import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const KEYS = {
  queue: 'rhucare_queue',
  appointments: 'rhucare_appts',
  patients: 'rhucare_patients',
  transport: 'rhucare_transport',
  dependents: 'rhucare_deps',
  profile: 'rhucare_profile',
  pin: 'rhucare_pin',
};

export function load<T>(key: keyof typeof KEYS): T[] {
  try {
    const data = localStorage.getItem(KEYS[key]);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error(`Error loading ${key}:`, e);
    return [];
  }
}

export function save<T>(key: keyof typeof KEYS, data: T[]): void {
  localStorage.setItem(KEYS[key], JSON.stringify(data));
}

export function loadObj<T>(key: keyof typeof KEYS): T | null {
  try {
    const data = localStorage.getItem(KEYS[key]);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error(`Error loading object ${key}:`, e);
    return null;
  }
}

export function saveObj<T>(key: keyof typeof KEYS, obj: T): void {
  localStorage.setItem(KEYS[key], JSON.stringify(obj));
}

export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export function pst() {
  return new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Manila' }));
}

export function fmtTime(d: Date) {
  return d.toLocaleString('en-PH', { timeZone: 'Asia/Manila', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

export function fmtDate(d: Date) {
  return d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', year: 'numeric', month: 'long', day: 'numeric' });
}

export function fmtShort(d: Date) {
  return d.toLocaleDateString('en-PH', { timeZone: 'Asia/Manila', month: 'short', day: 'numeric', year: 'numeric' });
}

export function todayKey() {
  return pst().toLocaleDateString('en-CA', { timeZone: 'Asia/Manila' });
}
