import express from 'express'; // Use default import for express
import cors from 'cors';
// No need to import Request, Response, z, PrismaClient, UserRole here anymore

// Import your modular routers
import authRouter from './routes/authRoutes';
import postRouter from './routes/postRoute';
import celebrityRouter from './routes/celiberityRoute';
import followRouter from './routes/followRoute';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Mount your routers
// All routes in authRouter will be prefixed with '/auth'
app.use('/auth', authRouter);

// All routes in postRouter will be mounted directly
// If you want them under a specific prefix, e.g., '/posts', change it to app.use('/posts', postRouter);
// For now, I'm keeping your original paths like /getAll, /getFeed
app.use('/', postRouter);

// All routes in celebrityRouter will be prefixed with '/celebrities'
app.use('/celebrities', celebrityRouter);

// All routes in followRouter will be prefixed with '/follow'
app.use('/follow', followRouter);


// Basic root endpoint (optional)
app.get('/', (req, res) => {
  res.send('API is running!');
});

// Listening
app.listen(PORT, () => {
  console.log(`Backend: Server running on http://localhost:${PORT}`);
});