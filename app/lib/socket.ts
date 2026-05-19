// app/lib/socket.ts
import { Server, type Socket } from "socket.io";
import type { Server as HTTPServer } from "http";

const CLIENT_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let io: Server | null = null;

/**
 * Initialize Socket.IO server (called once from server.ts)
 */
export function initSocket(httpServer: HTTPServer): Server {
  if (io) return io;

  io = new Server(httpServer, {
    cors: {
      origin: CLIENT_URL,
      methods: ["GET", "POST"],
      credentials: true,
    },
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Join feed room for real-time updates
    socket.join("feed-room");

    socket.on("disconnect", (reason: string) => {
      console.log(`🔌 Client disconnected: ${socket.id} (${reason})`);
    });
  });

  console.log("✅ Socket.IO initialized");
  return io;
}

/**
 * Get Socket.IO instance (for use in API routes)
 */
export function getIO(): Server {
  if (!io) {
    throw new Error("Socket.IO not initialized - call initSocket first");
  }
  return io;
}

/**
 * Emit event to all clients in feed room
 */
export function emitToFeed(event: string, data: unknown): void {
  getIO().to("feed-room").emit(event, data);
}