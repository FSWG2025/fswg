const COOKIE_KEY = "fswg_vid";
const STORAGE_KEY = "fswg_vid";
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));
  return match ? decodeURIComponent(match.split("=").slice(1).join("=")) : null;
}

function writeCookie(name: string, value: string) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONE_YEAR}; SameSite=Lax`;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
}

/** Stable anonymous visitor id (cookie + localStorage backup). */
export function getOrCreateVisitorId(): string {
  try {
    const fromCookie = readCookie(COOKIE_KEY);
    if (fromCookie) {
      localStorage.setItem(STORAGE_KEY, fromCookie);
      return fromCookie;
    }
    const fromStorage = localStorage.getItem(STORAGE_KEY);
    if (fromStorage) {
      writeCookie(COOKIE_KEY, fromStorage);
      return fromStorage;
    }
    const id = createId();
    writeCookie(COOKIE_KEY, id);
    localStorage.setItem(STORAGE_KEY, id);
    return id;
  } catch {
    return createId();
  }
}
