import axios from "axios";

const api = axios.create({
  baseURL:
    (import.meta as any).env?.VITE_API_BASE_URL ||
    "http://localhost:5000/api",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

// ────────────────────────────────────────────────
// REQUEST INTERCEPTOR: attach token from localStorage
// ────────────────────────────────────────────────
api.interceptors.request.use((config) => {
  config.withCredentials = true;
  // Custom header required by backend csrfGuard for cookie-authenticated mutations
  config.headers["X-Requested-With"] = "XMLHttpRequest";

  // Fallback: if the browser doesn't send the cookie,
  // we use the token stored in localStorage
  const token = localStorage.getItem("fswg_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let the browser set multipart boundary: never force JSON on FormData
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (config.headers && typeof (config.headers as any).delete === "function") {
      (config.headers as any).delete("Content-Type");
    } else if (config.headers) {
      delete (config.headers as any)["Content-Type"];
      delete (config.headers as any)["content-type"];
    }
  }

  if ((import.meta as any).env?.DEV) {
    const url = String(config.url || "");
    const safe = url.includes("reset-password")
      ? url.replace(/reset-password\/[^/?#]+/i, "reset-password/[redacted]")
      : url;
    console.log(`[API] ${config.method?.toUpperCase()} ${safe}`);
  }
  return config;
});

// ────────────────────────────────────────────────
// RESPONSE INTERCEPTOR: store token on login/register
// ────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => {
    // Any response that contains a token (login, register)
    // will be saved to localStorage automatically
    const data = response.data;
    // Prefer httpOnly cookie; keep Bearer only as a same-origin fallback for sockets.
    // Never persist the token inside the user object (handled in AuthProvider).
    if (data && typeof data.token === "string" && data.token) {
      localStorage.setItem("fswg_token", data.token);
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const is401 = error.response?.status === 401;
    const pathname = window.location.pathname;
    const isAuthPage =
      pathname === "/login" ||
      pathname === "/register" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password" ||
      pathname.startsWith("/reset-password/");

    if (!is401 || isAuthPage) return Promise.reject(error);

    const redact = (url: string) =>
      String(url || "").replace(
        /reset-password\/[^/?#]+/i,
        "reset-password/[redacted]",
      );

    // If we already retried this request, just reject, do NOT logout
    if (originalRequest._retry) {
      if ((import.meta as any).env?.DEV) {
        console.warn(
          `[API] 401 on retry for ${redact(originalRequest.url)}, giving up`,
        );
      }
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    if ((import.meta as any).env?.DEV) {
      console.log(`[API] Retrying ${redact(originalRequest.url)} after 401`);
    }

    try {
      const retryResponse = await api(originalRequest);
      return retryResponse;
    } catch (retryError) {
      if ((import.meta as any).env?.DEV) {
        console.warn(`[API] Retry failed for ${redact(originalRequest.url)}`);
      }
      return Promise.reject(retryError);
    }
  }
);

export { api };