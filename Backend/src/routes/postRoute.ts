import { Router, Request, Response } from 'express';
import express from "express"
import { prisma } from '../app';

const postRouter = express.Router();

// GET /getAll endpoint (universal public feed)
postRouter.get('/getAll', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    let posts;
    let hasMore = false;

    const findManyOptions: any = {
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
            role: true
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
        findManyOptions.where = {
          createdAt: {
            lt: cursorDate
          }
        };
      }
    }

    posts = await prisma.post.findMany(findManyOptions);

    hasMore = posts.length > limit;
    if (hasMore) {
      posts = posts.slice(0, limit);
    }

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          limit,
          hasMore,
          nextCursor,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching all posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch all posts',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /getFeed/:userId endpoint (user's personalized feed)
postRouter.get('/getFeed/:userId', async (req: any, res: any) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string | undefined;

    const followedCelebrities = await prisma.follow.findMany({
      where: { userId },
      select: { celebrityId: true }
    });
    const celebrityIds = followedCelebrities.map(f => f.celebrityId);

    if (celebrityIds.length === 0) {
      return res.json({
        success: true,
        data: {
          posts: [],
          pagination: {
            limit,
            hasMore: false,
            nextCursor: null,
          }
        }
      });
    }

    let posts;
    let hasMore = false;

    const findManyOptions: any = {
      where: {
        authorId: {
          in: celebrityIds
        },
      },
      include: {
        author: { select: { id: true, username: true, avatarUrl: true, isVerified: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1
    };

    if (cursor) {
      const cursorDate = new Date(cursor);
      if (!isNaN(cursorDate.getTime())) {
        findManyOptions.where.createdAt = { lt: cursorDate };
      } else {
        console.warn('Invalid cursor date received for getFeed:', cursor);
      }
    }

    posts = await prisma.post.findMany(findManyOptions);
    hasMore = posts.length > limit;
    if (hasMore) { posts = posts.slice(0, limit); }
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          limit,
          hasMore,
          nextCursor,
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user feed',
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// POST /createPost endpoint
postRouter.post('/createPost', async (req: any, res: any) => {
  try {
    const { userId, content, imageUrl } = req.body;

    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'UserId and content are required'
      });
    }

    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.role !== 'CELEBRITY') {
      return res.status(403).json({
        success: false,
        message: 'Only celebrities can create posts'
      });
    }

    const newPost = await prisma.post.create({
      data: {
        content: content.trim(),
        imageUrl: imageUrl || null,
        authorId: userId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
            role: true
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        post: {
          id: newPost.id,
          content: newPost.content,
          imageUrl: newPost.imageUrl,
          likesCount: newPost.likesCount,
          createdAt: newPost.createdAt,
          author: newPost.author
        }
      },
      message: 'Post created successfully'
    });

  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create post',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});

// New endpoint: Get posts by celebrity ID
postRouter.get('/getPostsByCelebrity/:celebrityId', async (req: any, res: any) => {
  try {
    const { celebrityId } = req.params;

    const celebrity = await prisma.user.findUnique({
      where: {
        id: celebrityId,
        role: 'CELEBRITY'
      },
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        isVerified: true
      }
    });

    if (!celebrity) {
      return res.status(404).json({
        success: false,
        message: 'Celebrity not found'
      });
    }

    const posts = await prisma.post.findMany({
      where: {
        authorId: celebrityId
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            isVerified: true,
            role: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      success: true,
      data: {
        celebrity,
        posts
      }
    });

  } catch (error) {
    console.error('Error fetching celebrity posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch celebrity posts',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});

export default postRouter;