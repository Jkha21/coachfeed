import { createServer } from "http";
import next from "next";
import { parse } from "url";
import { dbConnect } from "@/lib/db";
import { initSocket } from "@/lib/socket";
import { disconnectRedis } from "@/lib/redis";
import mongoose from "mongoose";


const dev  = process.env.NODE_ENV !== "production";
const PORT = dev ? 3001 : Number(process.env.PORT ?? 3000);

const app    = next({ dev });
const handle = app.getRequestHandler();

async function startServer(): Promise<void> {
  try {
    await dbConnect();
    await app.prepare();

    const server = createServer((req, res) => {
      handle(req, res, parse(req.url!, true));
    });

    initSocket(server);

    server.listen(PORT, () => {
      console.log(`✅ Server running`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\nℹ️  ${signal} received — shutting down gracefully…`);

      server.close(async () => {
        try {
          await disconnectRedis();
          await mongoose.disconnect();
          console.log("✅ Clean shutdown complete");
          process.exit(0);
        } catch (err) {
          console.error("❌ Error during shutdown:", err);
          process.exit(1);
        }
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT",  () => shutdown("SIGINT"));

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();