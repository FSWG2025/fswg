/** Query keys that must never seed auth forms or linger on auth URLs. */
export const SENSITIVE_AUTH_QUERY_KEYS = [
  "password",
  "pass",
  "pwd",
  "token",
  "jwt",
  "access_token",
  "refresh_token",
  "secret",
] as const;

/**
 * Strip credential-like params from a query string.
 * Returns null when nothing changed.
 */
export function stripSensitiveAuthParams(
  searchParams: URLSearchParams,
): URLSearchParams | null {
  const next = new URLSearchParams(searchParams);
  let dirty = false;
  for (const key of SENSITIVE_AUTH_QUERY_KEYS) {
    if (next.has(key)) {
      next.delete(key);
      dirty = true;
    }
  }
  // If a password-like param was present, also drop email to avoid paired leaks
  if (dirty && next.has("email")) {
    next.delete("email");
  }
  return dirty ? next : null;
}
