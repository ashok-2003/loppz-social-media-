"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const app_1 = require("../app");
const followRouter = (0, express_1.Router)();
// GET /getUserFollowing/:userId endpoint
followRouter.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await app_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        const following = await app_1.prisma.follow.findMany({
            where: { userId: userId },
            select: { celebrityId: true, createdAt: true }
        });
        const followedCelebrityIds = following.map(f => f.celebrityId);
        res.json({
            success: true,
            data: {
                followedCelebrityIds,
                followingCount: following.length
            }
        });
    }
    catch (error) {
        console.error('Error fetching user following:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch user following',
            error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
        });
    }
});
// POST /followCelebrity endpoint
followRouter.post('/', async (req, res) => {
    try {
        const { userId, celebrityId } = req.body;
        if (!userId || !celebrityId) {
            return res.status(400).json({
                success: false,
                message: 'UserId and celebrityId are required'
            });
        }
        const celebrity = await app_1.prisma.user.findUnique({
            where: { id: celebrityId, role: 'CELEBRITY' }
        });
        if (!celebrity) {
            return res.status(404).json({ success: false, message: 'Celebrity not found' });
        }
        const user = await app_1.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        const existingFollow = await app_1.prisma.follow.findUnique({
            where: {
                userId_celebrityId: {
                    userId,
                    celebrityId
                }
            }
        });
        let action = '';
        let followRecord;
        if (existingFollow) {
            await app_1.prisma.follow.delete({
                where: {
                    userId_celebrityId: { userId, celebrityId }
                }
            });
            action = 'unfollowed';
            followRecord = null;
        }
        else {
            followRecord = await app_1.prisma.follow.create({
                data: { userId, celebrityId }
            });
            action = 'followed';
        }
        const followerCount = await app_1.prisma.follow.count({ where: { celebrityId } });
        res.json({
            success: true,
            data: {
                action,
                isFollowing: !!followRecord,
                followerCount,
                celebrity: {
                    id: celebrity.id,
                    username: celebrity.username
                }
            },
            message: `Successfully ${action} ${celebrity.username}`
        });
    }
    catch (error) {
        console.error('Error following/unfollowing celebrity:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to follow/unfollow celebrity',
            error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
        });
    }
});
exports.default = followRouter;
