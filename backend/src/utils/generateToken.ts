import jwt, { type SignOptions } from "jsonwebtoken";
import { type Response } from "express";

export type TokenClaims = {
  userId: string;
  sessionVersion?: number;
  impersonatorId?: string;
  grantId?: string;
};

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isProduction ? "none" : "lax") as "none" | "lax",
    maxAge: 30 * 24 * 60 * 60 * 1000,
    path: "/",
  };
}

/**
 * Generate JWT token and set it as HTTP-only cookie
 */
export const generateToken = (
  userId: string,
  res: Response,
  extras?: Omit<TokenClaims, "userId">,
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const payload: TokenClaims = {
    userId,
    sessionVersion: extras?.sessionVersion ?? 0,
  };
  if (extras?.impersonatorId) payload.impersonatorId = extras.impersonatorId;
  if (extras?.grantId) payload.grantId = extras.grantId;

  const token = jwt.sign(payload, process.env.JWT_SECRET as string, {
    expiresIn: extras?.impersonatorId ? ("30m" as const) : ("30d" as const),
    algorithm: "HS512",
    issuer: "firststepwealth-group",
    audience: "fswg-platform",
  } as SignOptions);

  res.cookie("jwt", token, cookieOptions());
  return token;
};

export const generateShortLivedToken = (
  userId: string,
  expiresIn: string = "30m",
): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: expiresIn,
    algorithm: "HS512",
  } as SignOptions);
};

export const verifyToken = (token: string): TokenClaims | null => {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }

    return jwt.verify(token, process.env.JWT_SECRET as string, {
      algorithms: ["HS512"],
      issuer: "firststepwealth-group",
      audience: "fswg-platform",
    }) as TokenClaims;
  } catch (error) {
    console.error("Token verification failed:", (error as Error).message);
    return null;
  }
};

export const clearToken = (res: Response): void => {
  res.cookie("jwt", "", {
    ...cookieOptions(),
    expires: new Date(0),
    maxAge: 0,
  });
};

export const decodeToken = (token: string): any => {
  try {
    return jwt.decode(token);
  } catch {
    return null;
  }
};
