// app/api/feed/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';
import Feed from '@/models/feedModel';
import { validatePost, PostInput } from '@/validators/feedValidator';

const CACHE_TTL = 300; // 5 minutes

// GET /api/feed - Get all feeds
export async function GET(request: NextRequest) {
    try {
        const redis = await getRedisClient();
        const cacheKey = 'feeds:all';
        
        // Check Redis cache first
        const cachedFeeds = await redis.get(cacheKey);
        
        if (cachedFeeds) {
            return NextResponse.json({
                success: true,
                data: JSON.parse(cachedFeeds),
                source: 'cache'
            });
        }
        
        // Get from database
        const feeds = await Feed.find()
            .sort({ createdAt: -1 })
            .limit(50)
            .lean();
        
        // Store in Redis cache
        await redis.setEx(cacheKey, CACHE_TTL, JSON.stringify(feeds));
        
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
        
        // Invalidate Redis cache
        const redis = await getRedisClient();
        await redis.del('feeds:all');
        
        // Emit WebSocket event for real-time update
        try {
            const { getIO } = await import('@/lib/socket');
            const io = getIO();
            if (io) {
                io.to('feed-room').emit('new_feed', newFeed);
            }
        } catch (err) {
            // WebSocket not available, skip real-time emit
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