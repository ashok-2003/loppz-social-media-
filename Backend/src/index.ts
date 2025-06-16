import cors from "cors";
import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, UserRole } from '@prisma/client';





const express = require('express');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const prisma = new PrismaClient();




//zod validation checks 
const authPayloadSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  role: z.boolean().optional(),
});






// all endpoints 
app.post('/auth', async (req: Request, res: Response) => {
  // Validate the request body using Zod
  const parsedBody = authPayloadSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: 'Invalid request payload',
      errors: parsedBody.error.errors,
    });
  }

  const { email, password, username, role } = parsedBody.data;

  try {
    // Attempt to find an existing user by their email (case-insensitive search)
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // --- Case 1: Existing User (Attempt Login) ---
    if (user) {
      if (user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        return res.status(200).json({
          message: 'Login successful',
          user: {
            id: userWithoutPassword.id,
            email: userWithoutPassword.email,
            username: userWithoutPassword.username,
            role: userWithoutPassword.role,
            isVerified: userWithoutPassword.isVerified,
            unreadNotificationCount: userWithoutPassword.unreadNotificationCount,
          },
        });
      } else {
        return res.status(401).json({ message: 'Invalid credentials.' });
      }
    }
    else {
      // If no user found, it's treated as a registration attempt
      // For new registrations, a username is required
      if (!username) {
        return res.status(400).json({ message: 'Username is required to create a new account.' });
      }

      const newUserRole = role ? UserRole.CELEBRITY : UserRole.PUBLIC;

      const newUser = await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          password: password,
          username: username,
          role: newUserRole,
          isVerified: false,
          avatarUrl: null,
          unreadNotificationCount: 0,
        },
      });
      console.log(`Backend: New user registered: ${newUser.username} (${newUser.email})`);

      const { password: _, ...newUserWithoutPassword } = newUser;
      return res.status(201).json({
        message: 'User registered successfully',
        user: {
          id: newUserWithoutPassword.id,
          email: newUserWithoutPassword.email,
          username: newUserWithoutPassword.username,
          role: newUserWithoutPassword.role,
          isVerified: newUserWithoutPassword.isVerified,
          unreadNotificationCount: newUserWithoutPassword.unreadNotificationCount,
        },
      });
    }
  }
  catch (error) {
    console.error('Backend: Error in auth route:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
});


app.get('/getAll', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10; // Default 10 posts per page
    const cursor = req.query.cursor as string; // For cursor-based pagination (optional)

    let posts;
    let hasMore = false;

    // Build the where clause conditionally
    const whereClause: any = {};
    
    // Only add cursor filter if cursor is provided and valid
    if (cursor && cursor.trim() !== '') {
      const cursorDate = new Date(cursor);
      // Check if the date is valid
      if (!isNaN(cursorDate.getTime())) {
        whereClause.createdAt = {
          lt: cursorDate
        };
      }
    }

    // Cursor-based pagination (More efficient for infinite scroll)
    posts = await prisma.post.findMany({
      where: whereClause,
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
      take: limit + 1 // Take one extra to check if there are more
    });

    // Check if there are more posts
    hasMore = posts.length > limit;
    if (hasMore) {
      posts = posts.slice(0, limit);
    }

    // The next cursor is the createdAt timestamp of the very last post in the current batch
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          limit,
          hasMore,
          nextCursor,
          totalPosts: posts.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: error
    });
  }
});

// Alternative: Get posts for specific user's feed (followed celebrities only)
app.get('/getFeed/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;
    const cursor = req.query.cursor as string;

    // First, get the celebrities this user follows
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
            totalPosts: 0
          }
        }
      });
    }

    let posts;
    let hasMore = false;

    // Build the where clause conditionally
    const whereClause: any = {
      authorId: {
        in: celebrityIds
      }
    };

    // Only add cursor filter if cursor is provided and valid
    if (cursor && cursor.trim() !== '') {
      const cursorDate = new Date(cursor);
      // Check if the date is valid
      if (!isNaN(cursorDate.getTime())) {
        whereClause.createdAt = {
          lt: cursorDate
        };
      }
    }

    // Cursor-based pagination for feed
    posts = await prisma.post.findMany({
      where: whereClause,
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
    });

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
          totalPosts: posts.length
        }
      }
    });

  } catch (error) {
    console.error('Error fetching user feed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user feed',
      error: error
    });
  }
});


// Fixed /getCelebrities endpoint
app.get('/getCelebrities', async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const sortBy = req.query.sortBy as string || 'username'; // username, followers, posts, createdAt
    const sortOrder = req.query.sortOrder as string || 'asc'; // asc, desc
    const verified = req.query.verified as string; // true, false, or undefined for all
    const userId = req.query.userId as string; // Optional: to include follow status

    // Build where clause
    const whereClause: any = {
      role: 'CELEBRITY'
    };

    // Add search filter
    if (search) {
      whereClause.OR = [
        {
          username: {
            contains: search,
            mode: 'insensitive'
          }
        },
        {
          email: {
            contains: search,
            mode: 'insensitive'
          }
        }
      ];
    }

    // Add verified filter
    if (verified !== undefined) {
      whereClause.isVerified = verified === 'true';
    }

    // Get user's followed celebrities if userId is provided
    let followedCelebrityIds: string[] = [];
    if (userId) {
      const followedCelebrities = await prisma.follow.findMany({
        where: { userId },
        select: { celebrityId: true }
      });
      followedCelebrityIds = followedCelebrities.map(f => f.celebrityId);
    }

    // Determine sort field for orderBy
    let orderByField: any = {};
    if (sortBy === 'followers') {
      // We'll sort by followers count after fetching
      orderByField = { createdAt: sortOrder as 'asc' | 'desc' };
    } else if (sortBy === 'posts') {
      // We'll sort by posts count after fetching
      orderByField = { createdAt: sortOrder as 'asc' | 'desc' };
    } else {
      orderByField = { [sortBy]: sortOrder as 'asc' | 'desc' };
    }

    // Fetch all celebrities at once
    const celebrities = await prisma.user.findMany({
      where: whereClause,
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
            followers: true, // This counts how many Follow records have this user as celebrityId
            following: true  // This counts how many Follow records have this user as userId
          }
        }
      },
      orderBy: orderByField
    });

    // Transform the data and add follow status
    let celebritiesWithFollowStatus = celebrities.map((celebrity: any) => ({
      id: celebrity.id,
      username: celebrity.username,
      email: celebrity.email,
      avatarUrl: celebrity.avatarUrl,
      isVerified: celebrity.isVerified,
      role: celebrity.role,
      createdAt: celebrity.createdAt,
      bio: celebrity.bio,
      isFollowed: userId ? followedCelebrityIds.includes(celebrity.id) : undefined,
      followersCount: celebrity._count.followers,
      followingCount: celebrity._count.following,
      postsCount: celebrity._count.posts
    }));

    // Sort by followers or posts count if needed (since Prisma can't sort by _count directly)
    if (sortBy === 'followers') {
      celebritiesWithFollowStatus.sort((a, b) => {
        const aValue = a.followersCount;
        const bValue = b.followersCount;
        return sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
      });
    } else if (sortBy === 'posts') {
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
        filters: {
          search: search || null,
          sortBy,
          sortOrder,
          verified: verified || null
        }
      }
    });

  } catch (error) {
    console.error('Error fetching celebrities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch celebrities',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});

// Fixed /getCelebrity/:celebrityId endpoint
app.get('/getCelebrity/:celebrityId', async (req: Request, res: Response) => {
  try {
    const { celebrityId } = req.params;
    const userId = req.query.userId as string; // Optional: to include follow status

    const celebrity = await prisma.user.findUnique({
      where: {
        id: celebrityId,
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
            followers: true, // Count of people following this celebrity
            following: true  // Count of people this celebrity follows
          }
        }
      }
    });

    if (!celebrity) {
      return res.status(404).json({
        success: false,
        message: 'Celebrity not found'
      });
    }

    // Check if user follows this celebrity
    let isFollowed = false;
    if (userId) {
      const followRecord = await prisma.follow.findUnique({
        where: {
          userId_celebrityId: {
            userId,
            celebrityId
          }
        }
      });
      isFollowed = !!followRecord;
    }

    // Get recent posts
    const recentPosts = await prisma.post.findMany({
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
      },
      take: 5
    });

    const celebrityData = {
      id: celebrity.id,
      username: celebrity.username,
      email: celebrity.email,
      avatarUrl: celebrity.avatarUrl,
      isVerified: celebrity.isVerified,
      role: celebrity.role,
      createdAt: celebrity.createdAt,
      bio: celebrity.bio,
      isFollowed: userId ? isFollowed : undefined,
      followersCount: celebrity._count.followers,
      followingCount: celebrity._count.following,
      postsCount: celebrity._count.posts,
      recentPosts
    };

    res.json({
      success: true,
      data: {
        celebrity: celebrityData
      }
    });

  } catch (error) {
    console.error('Error fetching celebrity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch celebrity',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});

// The follow/unfollow endpoint should remain the same as it looks correct
app.post('/followCelebrity', async (req: Request, res: Response) => {
  try {
    const { userId, celebrityId } = req.body;

    if (!userId || !celebrityId) {
      return res.status(400).json({
        success: false,
        message: 'UserId and celebrityId are required'
      });
    }

    // Check if celebrity exists and is actually a celebrity
    const celebrity = await prisma.user.findUnique({
      where: {
        id: celebrityId,
        role: 'CELEBRITY'
      }
    });

    if (!celebrity) {
      return res.status(404).json({
        success: false,
        message: 'Celebrity not found'
      });
    }

    // Check if user exists
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

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
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
      // Unfollow
      await prisma.follow.delete({
        where: {
          userId_celebrityId: {
            userId,
            celebrityId
          }
        }
      });
      action = 'unfollowed';
      followRecord = null;
    } else {
      // Follow
      followRecord = await prisma.follow.create({
        data: {
          userId,
          celebrityId
        }
      });
      action = 'followed';
    }

    // Get updated follower count
    const followerCount = await prisma.follow.count({
      where: {
        celebrityId
      }
    });

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

  } catch (error) {
    console.error('Error following/unfollowing celebrity:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to follow/unfollow celebrity',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});





app.post('/createPost', async (req: Request, res: Response) => {
  try {
    const { userId, content, imageUrl } = req.body;

    // Validate required fields
    if (!userId || !content) {
      return res.status(400).json({
        success: false,
        message: 'UserId and content are required'
      });
    }

    // Check if user exists and is a celebrity
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

    // Create the post
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

// GET endpoint to fetch posts (for feed)
app.get('/getPosts', async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const posts = await prisma.post.findMany({
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
      skip,
      take: limit
    });

    // Get total count for pagination
    const totalPosts = await prisma.post.count();
    const hasMore = skip + limit < totalPosts;

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalPosts / limit),
          totalPosts,
          hasMore
        }
      }
    });

  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch posts',
      error: process.env.NODE_ENV === 'development' ? error : 'Internal server error'
    });
  }
});



// listening 
app.listen(PORT, () => {
  console.log(`Backend: Server running on http://localhost:${PORT}`);
});

