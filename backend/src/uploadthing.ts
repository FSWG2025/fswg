import { createUploadthing, type FileRouter } from "uploadthing/express";
import type { Request } from "express";
import jwt from "jsonwebtoken";
import User from "./models/User";
import { JWT_VERIFY_OPTIONS } from "./utils/jwtConfig";

const f = createUploadthing();

function readCookie(req: Request, name: string): string | null {
  const raw = req.headers.cookie;
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

async function requireVaultUser(req: Request) {
  const token =
    readCookie(req, "jwt") ||
    (typeof req.headers.authorization === "string" &&
    req.headers.authorization.startsWith("Bearer ")
      ? req.headers.authorization.slice(7)
      : null);

  if (!token || !process.env.JWT_SECRET) {
    throw new Error("Unauthorized");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET,
    JWT_VERIFY_OPTIONS,
  ) as { userId?: string; sessionVersion?: number };

  if (!decoded?.userId) throw new Error("Unauthorized");

  const user = await User.findById(decoded.userId).select(
    "_id role isActive sessionVersion softDeletedAt",
  );
  if (!user || !user.isActive || user.softDeletedAt) {
    throw new Error("Unauthorized");
  }
  const tokenSv =
    typeof decoded.sessionVersion === "number" ? decoded.sessionVersion : 0;
  const userSv =
    typeof user.sessionVersion === "number" ? user.sessionVersion : 0;
  if (tokenSv < userSv) throw new Error("Unauthorized");

  return user;
}

/**
 * UploadThing file router for client document vault.
 * Requires UPLOADTHING_TOKEN in backend env + authenticated JWT.
 */
export const ourFileRouter = {
  vaultUploader: f({
    pdf: { maxFileSize: "16MB", maxFileCount: 6 },
    image: { maxFileSize: "8MB", maxFileCount: 6 },
  })
    .middleware(async ({ req }) => {
      const user = await requireVaultUser(req as Request);
      return { vault: true as const, userId: String(user._id) };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log(
        "[UploadThing] uploaded:",
        metadata.userId,
        file.name,
        file.ufsUrl || file.url,
      );
      return {
        url: file.ufsUrl || file.url,
        name: file.name,
        key: file.key,
        size: file.size,
        userId: metadata.userId,
      };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
