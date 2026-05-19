// app/server.ts
import { createServer } from 'http';
import next from 'next';
import { parse } from 'url';
import { dbConnect } from '@/lib/db';
import { getRedisClient } from '@/lib/redis';
import { initSocket } from '@/lib/socket';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = dev ? 3001 : (process.env.PORT || 3000);

async function startServer() {
    try {
        await dbConnect();
        await getRedisClient();
        await app.prepare();

        const server = createServer((req, res) => {
            const parsedUrl = parse(req.url!, true);
            handle(req, res, parsedUrl);
        });

        // Initialize Socket.IO
        initSocket(server);

        server.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();