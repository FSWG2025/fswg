import type { VerifyOptions } from "jsonwebtoken";

/** Must match sign options in generateToken.ts */
export const JWT_VERIFY_OPTIONS: VerifyOptions = {
  algorithms: ["HS512"],
  issuer: "firststepwealth-group",
  audience: "fswg-platform",
};

export function clientErrorPayload(
  error: unknown,
  fallback = "Server Error",
): { message: string; error?: string } {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return { message: fallback };
  return {
    message: fallback,
    error: error instanceof Error ? error.message : String(error),
  };
}
