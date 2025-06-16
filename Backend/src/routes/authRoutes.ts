import { Router, Request, Response } from 'express';
import { UserRole } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../app';

const authRouter = Router();



//zod validation checks 
const authPayloadSchema = z.object({
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters long.'),
  username: z.string().min(3, 'Username must be at least 3 characters long.'),
  role: z.boolean().optional(),
});

authRouter.post('/', async (req: any, res: any) => {
  const parsedBody = authPayloadSchema.safeParse(req.body);

  if (!parsedBody.success) {
    return res.status(400).json({
      message: 'Invalid request payload',
      errors: parsedBody.error.errors,
    });
  }

  const { email, password, username, role } = parsedBody.data;

  try {
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

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
    } else {
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
  } catch (error) {
    console.error('Backend: Error in auth route:', error);
    return res.status(500).json({ message: 'Internal server error during authentication.' });
  }
});

export default authRouter;