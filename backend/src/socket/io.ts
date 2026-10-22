import type { Server as HttpServer } from "http";
import { Server, type Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User";
import { JWT_VERIFY_OPTIONS } from "../utils/jwtConfig";
import { isPlatformAdmin } from "../constants/roles";

let io: Server | null = null;

const ADMIN_ROOM = "admins";

function parseCookie(header: string | undefined, name: string): string | null {
  if (!header) return null;
  const parts = header.split(";").map((p) => p.trim());
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq).trim();
    if (key === name) return decodeURIComponent(part.slice(eq + 1).trim());
  }
  return null;
}

export async function resolveUserFromSocket(socket: Socket) {
  const authToken =
    (socket.handshake.auth as { token?: string } | undefined)?.token ||
    (typeof socket.handshake.headers.authorization === "string" &&
    socket.handshake.headers.authorization.startsWith("Bearer ")
      ? socket.handshake.headers.authorization.slice(7)
      : null) ||
    parseCookie(socket.handshake.headers.cookie, "jwt");

  if (!authToken || !process.env.JWT_SECRET) return null;

  try {
    const decoded = jwt.verify(
      authToken,
      process.env.JWT_SECRET,
      JWT_VERIFY_OPTIONS,
    ) as {
      userId?: string;
      sessionVersion?: number;
    };
    if (!decoded?.userId) return null;
    const user = await User.findById(decoded.userId).select(
      "_id name role isActive sessionVersion softDeletedAt",
    );
    if (!user || !user.isActive || user.softDeletedAt) return null;
    const tokenSv =
      typeof decoded.sessionVersion === "number" ? decoded.sessionVersion : 0;
    const userSv =
      typeof user.sessionVersion === "number" ? user.sessionVersion : 0;
    if (tokenSv < userSv) return null;
    return user;
  } catch {
    return null;
  }
}

export function getIO(): Server | null {
  return io;
}

export function emitToAdmins(event: string, payload: unknown) {
  if (!io) return;
  io.to(ADMIN_ROOM).emit(event, payload);
}

export function initSocketServer(
  httpServer: HttpServer,
  allowedOrigins: (string | undefined)[]
): Server {
  const origins = allowedOrigins.filter(Boolean) as string[];

  io = new Server(httpServer, {
    cors: {
      origin: (origin, cb) => {
        if (!origin || origins.includes(origin)) {
          cb(null, true);
        } else {
          cb(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    },
    path: "/socket.io",
  });

  io.on("connection", (socket: Socket) => {
    socket.on("admin:subscribe", async () => {
      const user = await resolveUserFromSocket(socket);
      if (!user || !isPlatformAdmin(user.role)) {
        socket.emit("admin:subscribe:error", { message: "Admins only" });
        return;
      }
      socket.join(ADMIN_ROOM);
      socket.emit("admin:subscribe:ok");
    });

    socket.on("admin:unsubscribe", () => {
      socket.leave(ADMIN_ROOM);
    });
  });

  return io;
}
