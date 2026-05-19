// app/lib/redis.ts
import { createClient } from 'redis';

let client: ReturnType<typeof createClient> | null = null;

export async function getRedisClient() {
    if (!client) {
        client = createClient({
            username: process.env.REDIS_USERNAME,
            password: process.env.REDIS_PASSWORD,
            socket: {
                host: process.env.REDIS_HOST,
                port: parseInt(process.env.REDIS_PORT || '6379'),
            }
        });

        client.on('error', (err: Error) => console.log('Redis Client Error', err));
        
        await client.connect();
        console.log('Redis connected');
    }
    
    return client;
}

export async function disconnectRedis() {
    if (client) {
        await client.quit();
        client = null;
        console.log('Redis disconnected');
    }
}