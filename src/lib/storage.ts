// src/lib/storage.ts
export function saveDraft(key: string, data: unknown) {
  if (typeof window === "undefined") return; // evita SSR
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
}

export function loadDraft<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback; // evita SSR
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function clearDraft(key: string) {
  if (typeof window === "undefined") return; // evita SSR
  try {
    localStorage.removeItem(key);
  } catch {}
}
