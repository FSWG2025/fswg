/** API origin without trailing /api (e.g. http://localhost:5000). */
export function apiOrigin(): string {
  const base =
    (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:5000/api";
  return String(base).replace(/\/api\/?$/, "");
}

/**
 * Turn a stored upload path into a browsable URL.
 * Prefers same-origin `/uploads/...` (Vite proxies to the API in dev).
 * Also normalizes bare filenames into `/uploads/documents/...` when needed.
 */
const ALLOWED_REMOTE_HOSTS = [
  "utfs.io",
  "ufs.sh",
  "uploadthing.com",
  "uploadthing-prod.s3.us-west-2.amazonaws.com",
];

function isAllowedRemoteUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || host === "127.0.0.1") return true;
    return ALLOWED_REMOTE_HOSTS.some(
      (h) => host === h || host.endsWith(`.${h}`),
    );
  } catch {
    return false;
  }
}

export function resolveUploadUrl(docPath: string): string {
  if (!docPath) return "";
  if (/^https?:\/\//i.test(docPath)) {
    return isAllowedRemoteUrl(docPath) ? docPath : "";
  }

  let path = docPath.startsWith("/") ? docPath : `/${docPath}`;

  // Reject traversal / unexpected schemes disguised as paths
  if (path.includes("..") || path.includes("://")) return "";

  // Legacy paths: /uploads/file.pdf → keep as-is (backend resolves subdirs)
  if (!path.startsWith("/uploads/")) {
    path = `/uploads/${path.replace(/^\//, "")}`;
  }

  // In the browser, same-origin /uploads is proxied; absolute API origin as fallback
  if (typeof window !== "undefined") {
    return path;
  }
  return `${apiOrigin()}${path}`;
}

export function uploadFilename(docPath: string): string {
  return docPath.split("/").pop() || docPath;
}

export function isPdfPath(docPath: string): boolean {
  return /\.pdf$/i.test(docPath) || docPath.toLowerCase().includes("application/pdf");
}
