"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_1 = require("../app");
const celebrityRouter = express_1.default.Router();
// GET /getCelebrities endpoint with Cursor Pagination
celebrityRouter.get('/', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const cursor = req.query.cursor;
        let celebrities;
        let hasMore = false;
        const findManyOptions = {
            where: {
                role: 'CELEBRITY'
            },
            select: {
                id: true,
                username: true,
                email: true,
                avatarUrl: true,
                isVerified: true,
                role: true,
                createdAt: true,
                bio: true,
                _count: {
                    select: {
                        posts: true,
                        followers: true,
                        following: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit + 1
        };
        if (cursor) {
            const cursorDate = new Date(cursor);
            if (!isNaN(cursorDate.getTime())) {
                findManyOptions.where.createdAt = {
                    lt: cursorDate
                };
            }
            else {
                console.warn('Invalid cursor date received for getCelebrities:', cursor);
            }
        }
        celebrities = await app_1.prisma.user.findMany(findManyOptions);
        hasMore = celebrities.length > limit;
        if (hasMore) {
            celebrities = celebrities.slice(0, limit);
        }
        const formattedCelebrities = celebrities.map((celebrity) => ({
            id: celebrity.id,
            username: celebrity.username,
            email: celebrity.email,
            avatarUrl: celebrity.avatarUrl,
            isVerified: celebrity.isVerified,
            role: celebrity.role,
            createdAt: celebrity.createdAt,
            bio: celebrity.bio,
            followersCount: celebrity._count.followers,
            followingCount: celebrity._count.following,
            postsCount: celebrity._count.posts,
        }));
        const nextCursor = celebrities.length > 0 ? celebrities[celebrities.length - 1].createdAt.toISOString() : null;
        res.json({
            success: true,
            data: {
                celebrities: formattedCelebrities,
                pagination: {
                    limit,
                    hasMore,
                    nextCursor,
                    totalResultsInBatch: formattedCelebrities.length
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching celebrities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch celebrities',
            error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
        });
    }
});
// This was previously `/afgtxgg`, now named logically and separated.
// This endpoint retains the search/sort/filter capabilities for celebrities.
celebrityRouter.get('/search', async (req, res) => {
    try {
        const search = req.query.search;
        const sortBy = req.query.sortBy || 'username'; // username, followers, posts, createdAt
        const sortOrder = req.query.sortOrder || 'asc'; // asc, desc
        const verified = req.query.verified; // true, false, or undefined for all
        const userId = req.query.userId; // Optional: to include follow status
        const whereClause = {
            role: 'CELEBRITY'
        };
        if (search) {
            whereClause.OR = [
                { username: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }
        if (verified !== undefined) {
            whereClause.isVerified = verified === 'true';
        }
        let followedCelebrityIds = [];
        if (userId) {
            const followedCelebrities = await app_1.prisma.follow.findMany({
                where: { userId },
                select: { celebrityId: true }
            });
            followedCelebrityIds = followedCelebrities.map(f => f.celebrityId);
        }
        let orderByField = {};
        if (sortBy === 'followers') {
            orderByField = { createdAt: sortOrder }; // Placeholder for sorting by count
        }
        else if (sortBy === 'posts') {
            orderByField = { createdAt: sortOrder }; // Placeholder for sorting by count
        }
        else {
            orderByField = { [sortBy]: sortOrder };
        }
        const celebrities = await app_1.prisma.user.findMany({
            where: whereClause,
            select: {
                id: true, username: true, email: true, avatarUrl: true, isVerified: true, role: true, createdAt: true, bio: true,
                _count: {
                    select: { posts: true, followers: true, following: true }
                }
            },
            orderBy: orderByField
        });
        let celebritiesWithFollowStatus = celebrities.map((celebrity) => ({
            id: celebrity.id, username: celebrity.username, email: celebrity.email, avatarUrl: celebrity.avatarUrl,
            isVerified: celebrity.isVerified, role: celebrity.role, createdAt: celebrity.createdAt, bio: celebrity.bio,
            isFollowed: userId ? followedCelebrityIds.includes(celebrity.id) : undefined,
            followersCount: celebrity._count.followers,
            followingCount: celebrity._count.following,
            postsCount: celebrity._count.posts
        }));
        if (sortBy === 'followers') {
            celebritiesWithFollowStatus.sort((a, b) => {
                const aValue = a.followersCount;
                const bValue = b.followersCount;
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            });
        }
        else if (sortBy === 'posts') {
            celebritiesWithFollowStatus.sort((a, b) => {
                const aValue = a.postsCount;
                const bValue = b.postsCount;
                return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
            });
        }
        res.json({
            success: true,
            data: {
                celebrities: celebritiesWithFollowStatus,
                totalCelebrities: celebritiesWithFollowStatus.length,
                filters: { search: search || null, sortBy, sortOrder, verified: verified || null }
            }
        });
    }
    catch (error) {
        console.error('Error fetching celebrities:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch celebrities',
            error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
        });
    }
});
exports.default = celebrityRouter;
