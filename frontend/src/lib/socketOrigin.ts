/** Socket.IO origin (API host without `/api` suffix). */
export function socketOrigin(): string {
  const base =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api";
  return String(base).replace(/\/api\/?$/, "");
}
