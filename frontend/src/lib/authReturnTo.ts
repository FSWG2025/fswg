const STORAGE_KEY = "fswg:lastPublicPath";

const AUTH_PREFIXES = ["/login", "/register", "/forgot-password", "/reset-password"];

const PAGE_LABELS: Record<string, string> = {
  "/": "home",
  "/rental-guarantee": "Rental Guarantee",
  "/insurance": "Insurance",
  "/real-estate": "Real Estate",
  "/wealth": "Wealth",
  "/about": "About",
  "/testimonials": "Testimonials",
  "/services": "Services",
  "/blog": "Blog",
};

/** Reject protocol-relative, backslash open-redirects, and external URLs. */
function isSafeSameAppPath(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//")) return false;
  if (value.includes("://")) return false;
  // Block /\evil.com and encoded variants (react-router open-redirect class)
  if (value.includes("\\") || /%5c/i.test(value)) return false;
  if (/[\u0000-\u001f\u007f]/.test(value)) return false;
  return true;
}

/** Only allow same-app relative paths (no external / protocol URLs). */
export function sanitizeReturnTo(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep raw */
  }
  if (!isSafeSameAppPath(value)) return null;

  const pathOnly = value.split(/[?#]/)[0] || "/";
  if (AUTH_PREFIXES.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`))) {
    return null;
  }
  if (pathOnly.startsWith("/dashboard") || pathOnly.startsWith("/admin")) {
    return null;
  }
  return value;
}

/**
 * Allow in-app deep links (including /dashboard) for notifications.
 * Still blocks protocol-relative and external URLs.
 */
export function sanitizeAppPath(raw: string | null | undefined): string | null {
  if (!raw) return null;
  let value = raw.trim();
  try {
    value = decodeURIComponent(value);
  } catch {
    /* keep raw */
  }
  if (!isSafeSameAppPath(value)) return null;
  return value;
}

export function buildLocationKey(
  pathname: string,
  search = "",
  hash = "",
): string {
  return `${pathname}${search}${hash}` || "/";
}

export function rememberPublicLocation(
  pathname: string,
  search = "",
  hash = "",
): void {
  const pathOnly = pathname.split("?")[0] || "/";
  if (AUTH_PREFIXES.some((p) => pathOnly === p || pathOnly.startsWith(`${p}/`))) {
    return;
  }
  if (pathOnly.startsWith("/dashboard") || pathOnly.startsWith("/admin")) {
    return;
  }
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      buildLocationKey(pathname, search, hash),
    );
  } catch {
    /* private mode */
  }
}

export function readRememberedPublicLocation(): string | null {
  try {
    return sanitizeReturnTo(sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function resolveAuthReturnTo(options: {
  fromParam?: string | null;
  stateFrom?: unknown;
}): string {
  const fromState =
    typeof options.stateFrom === "string"
      ? options.stateFrom
      : options.stateFrom &&
          typeof options.stateFrom === "object" &&
          "pathname" in options.stateFrom
        ? buildLocationKey(
            String((options.stateFrom as { pathname?: string }).pathname || "/"),
            String((options.stateFrom as { search?: string }).search || ""),
            String((options.stateFrom as { hash?: string }).hash || ""),
          )
        : null;

  return (
    sanitizeReturnTo(options.fromParam) ||
    sanitizeReturnTo(fromState) ||
    readRememberedPublicLocation() ||
    "/"
  );
}

export function authReturnLabel(returnTo: string): string {
  const pathOnly = returnTo.split(/[?#]/)[0] || "/";
  const hash = returnTo.includes("#")
    ? returnTo.slice(returnTo.indexOf("#"))
    : "";

  if (pathOnly === "/") {
    return hash ? "Back to previous section" : "Back to home";
  }

  const page =
    PAGE_LABELS[pathOnly] ||
    (pathOnly.startsWith("/blog/") ? "Blog" : null);

  if (page) {
    return hash ? `Back to ${page}` : `Back to ${page}`;
  }
  return "Back to previous page";
}

/** Append or replace `from` on an auth link while preserving other query params. */
export function withReturnTo(
  authPath: string,
  returnTo: string,
): string {
  const safe = sanitizeReturnTo(returnTo) || "/";
  const [path, existing = ""] = authPath.split("?");
  const params = new URLSearchParams(existing);
  params.set("from", safe);
  const qs = params.toString();
  return qs ? `${path}?${qs}` : path;
}
