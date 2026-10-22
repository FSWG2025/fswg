import type { Server, Socket } from "socket.io";
import { resolveUserFromSocket } from "./io";

type PeerMeta = { userId: string; name: string; roomId: string };

const peers = new Map<string, PeerMeta>();

/** Register WebRTC signaling handlers on the shared Socket.IO server. */
export function registerVideoSignaling(io: Server) {
  io.on("connection", (socket: Socket) => {
    socket.on(
      "video:join",
      async ({
        roomId,
        name,
      }: {
        roomId: string;
        userId?: string;
        name?: string;
      }) => {
        const user = await resolveUserFromSocket(socket);
        if (!user) {
          socket.emit("video:error", { message: "Authentication required" });
          return;
        }
        if (!roomId) return;
        const cleanRoom = String(roomId).slice(0, 80);
        // Identity is always taken from the verified JWT — never client-supplied userId
        peers.set(socket.id, {
          userId: String(user._id),
          name: String(name || user.name || "Guest").slice(0, 80),
          roomId: cleanRoom,
        });
        socket.join(cleanRoom);

        const others = [...(io.sockets.adapter.rooms.get(cleanRoom) || [])]
          .filter((id) => id !== socket.id)
          .map((id) => {
            const meta = peers.get(id);
            return { socketId: id, userId: meta?.userId, name: meta?.name };
          });

        socket.emit("video:peers", others);
        socket.to(cleanRoom).emit("video:peer-joined", {
          socketId: socket.id,
          userId: peers.get(socket.id)?.userId,
          name: peers.get(socket.id)?.name,
        });
      },
    );

    socket.on("video:signal", async ({ to, data }: { to: string; data: unknown }) => {
      const user = await resolveUserFromSocket(socket);
      if (!user) return;
      const meta = peers.get(socket.id);
      if (!meta) return;
      io.to(to).emit("video:signal", { from: socket.id, data });
    });

    socket.on("video:leave", () => {
      leaveRoom(socket, io);
    });

    socket.on("disconnect", () => {
      leaveRoom(socket, io);
    });
  });
}

function leaveRoom(socket: Socket, io: Server) {
  const meta = peers.get(socket.id);
  if (!meta) return;
  socket.to(meta.roomId).emit("video:peer-left", { socketId: socket.id });
  peers.delete(socket.id);
  socket.leave(meta.roomId);
}
