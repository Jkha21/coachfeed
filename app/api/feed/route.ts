// app/api/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import Feed from '@/models/feedModel';
import { validatePost, PostInput } from '@/validators/feedValidator';
import { redisGet, redisSet, redisDel } from '@/lib/redis';

const CACHE_TTL = 300; // 5 minutes
const CACHE_KEY = 'feeds:all';

// GET /api/feed - Get all feeds
export async function GET(request: NextRequest) {
    try {
        // Use your wrapper to safely check Redis cache
        const cachedFeeds = await redisGet(CACHE_KEY);
        
        if (cachedFeeds) {
            return NextResponse.json({
                success: true,
                data: JSON.parse(cachedFeeds),
                source: 'cache'
            });
        }
        
        // Get from database on cache miss
        const feeds = await Feed.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        
        // Use your wrapper to safely store in Redis cache
        await redisSet(CACHE_KEY, JSON.stringify(feeds), CACHE_TTL);
        
        return NextResponse.json({
            success: true,
            data: feeds,
            source: 'database'
        });
        
    } catch (error) {
        console.error('GET /api/feed error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch feeds'
        }, { status: 500 });
    }
}

// POST /api/feed - Create new feed
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        // Validate using Joi schema
        const { error, value } = validatePost(body);
        
        if (error) {
            return NextResponse.json({
                success: false,
                error: 'Validation failed',
                details: error.details.map((detail) => detail.message)
            }, { status: 400 });
        }
        
        const { title, content, author } = value as PostInput;
        
        // Create new feed
        const newFeed = await Feed.create({
            title,
            content,
            author
        });
        
        // Use your wrapper to safely invalidate the Redis cache
        await redisDel(CACHE_KEY);
        
        // Emit WebSocket event for real-time update
        try {
            const { getIO } = await import('@/lib/socket');
            const io = getIO();
            if (io) {
                io.to('feed-room').emit('new_feed_item', newFeed);
                console.log('✅ WebSocket event emitted')
            }
        } catch (err) {
            console.log('WebSocket event skipped');
        }
        
        return NextResponse.json({
            success: true,
            message: 'Feed created successfully',
            data: newFeed
        }, { status: 201 });
        
    } catch (error) {
        console.error('POST /api/feed error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to create feed'
        }, { status: 500 });
    }
}