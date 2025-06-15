"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const zod_1 = require("zod");
const client_1 = require("@prisma/client");
const express = require('express');
const app = express();
app.use((0, cors_1.default)());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const prisma = new client_1.PrismaClient();
//zod validation checks 
const authPayloadSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address.'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters long.'),
    username: zod_1.z.string().min(3, 'Username must be at least 3 characters long.'),
    role: zod_1.z.boolean().optional(),
});
// all endpoints 
app.post('/auth', async (req, res) => {
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
            }
            else {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }
        }
        else {
            // If no user found, it's treated as a registration attempt
            // For new registrations, a username is required
            if (!username) {
                return res.status(400).json({ message: 'Username is required to create a new account.' });
            }
            const newUserRole = role ? client_1.UserRole.CELEBRITY : client_1.UserRole.PUBLIC;
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
// listening 
app.listen(PORT, () => {
    console.log(`Backend: Server running on http://localhost:${PORT}`);
});
