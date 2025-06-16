"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const express_1 = __importDefault(require("express")); // Use default import for express
const cors_1 = __importDefault(require("cors"));
// No need to import Request, Response, z, PrismaClient, UserRole here anymore
// Import your modular routers
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const postRoute_1 = __importDefault(require("./routes/postRoute"));
const celiberityRoute_1 = __importDefault(require("./routes/celiberityRoute"));
const followRoute_1 = __importDefault(require("./routes/followRoute"));
const client_1 = require("@prisma/client");
exports.prisma = new client_1.PrismaClient();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const PORT = process.env.PORT || 5000;
// Mount your routers
// All routes in authRouter will be prefixed with '/auth'
app.use('/auth', authRoutes_1.default);
// All routes in postRouter will be mounted directly
// If you want them under a specific prefix, e.g., '/posts', change it to app.use('/posts', postRouter);
// For now, I'm keeping your original paths like /getAll, /getFeed
app.use('/', postRoute_1.default);
// All routes in celebrityRouter will be prefixed with '/celebrities'
app.use('/celebrities', celiberityRoute_1.default);
// All routes in followRouter will be prefixed with '/follow'
app.use('/follow', followRoute_1.default);
// Basic root endpoint (optional)
app.get('/', (req, res) => {
    res.send('API is running!');
});
// Listening
app.listen(PORT, () => {
    console.log(`Backend: Server running on http://localhost:${PORT}`);
});
