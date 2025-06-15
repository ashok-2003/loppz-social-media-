import cors from "cors";
import { Request, Response } from 'express';
import { z } from 'zod';
import { PrismaClient, UserRole } from '@prisma/client';





const express = require('express');
const app =  express();
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

    const { email, password, username , role } = parsedBody.data;

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
        // Catch any database or unexpected errors
        console.error('Backend: Error in auth route:', error);
        return res.status(500).json({ message: 'Internal server error during authentication.' });
    }
});


app.get('/getAll', async (req: Request, res: Response) => {
  try {
    // Extract pagination parameters from query
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10; // Default 10 posts per page
    const cursor = req.query.cursor as string; // For cursor-based pagination (optional)
    
    // Calculate offset for page-based pagination
    const offset = (page - 1) * limit;

    let posts;
    let hasMore = false;

    if (cursor) {
      // Cursor-based pagination (More efficient for infinite scroll)
      posts = await prisma.post.findMany({
        where: {
          createdAt: {
            lt: new Date(cursor) // Get posts older than cursor
          }
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
        take: limit + 1 // Take one extra to check if there are more
      });

      // Check if there are more posts
      hasMore = posts.length > limit;
      if (hasMore) {
        posts = posts.slice(0, limit); // Remove the extra post
      }
    } else {
      // Offset-based pagination (Simpler but less efficient for large datasets)
      const [posts_data, totalCount] = await Promise.all([
        prisma.post.findMany({
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
          skip: offset,
          take: limit
        }),
        prisma.post.count() // Get total count for pagination info
      ]);

      posts = posts_data;
      hasMore = offset + limit < totalCount;
    }

    // Get the cursor for next page (last post's createdAt)
    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
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
    const page = parseInt(req.query.page as string) || 1;
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
            currentPage: page,
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

    if (cursor) {
      // Cursor-based pagination for feed
      posts = await prisma.post.findMany({
        where: {
          authorId: {
            in: celebrityIds
          },
          createdAt: {
            lt: new Date(cursor)
          }
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
        take: limit + 1
      });

      hasMore = posts.length > limit;
      if (hasMore) {
        posts = posts.slice(0, limit);
      }
    } else {
      // Offset-based pagination for feed
      const offset = (page - 1) * limit;
      
      const [posts_data, totalCount] = await Promise.all([
        prisma.post.findMany({
          where: {
            authorId: {
              in: celebrityIds
            }
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
          skip: offset,
          take: limit
        }),
        prisma.post.count({
          where: {
            authorId: {
              in: celebrityIds
            }
          }
        })
      ]);

      posts = posts_data;
      hasMore = offset + limit < totalCount;
    }

    const nextCursor = posts.length > 0 ? posts[posts.length - 1].createdAt.toISOString() : null;

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          currentPage: page,
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
})





// listening 
app.listen(PORT, () => {
  console.log(`Backend: Server running on http://localhost:${PORT}`);
});

