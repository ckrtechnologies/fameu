import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import 'dotenv/config';
import fs from 'fs';
import artistAppRoutes from "./src/api/artist_app/index.js";
import hiringAppRoutes from "./src/api/hiring_app/index.js";
import adminPanelRoutes from "./src/api/admin_panel/index.js";
import authRoutes from "./src/api/auth/index.js";
import paymentRoutes from "./src/api/payments/index.js";
import notificationRoutes from "./src/api/notifications/index.js";
import chatRoutes from "./src/api/shared/chat/chat.routes.js";
import connectionRoutes from "./src/api/connections/connections.routes.js";
import professionRoutes from "./src/api/shared/professions/professions.routes.js";
import commentsRoutes from "./src/api/comments/comments.routes.js";
import errorHandler from "./src/core/middlewares/errorHandler.js";
import socketManager from "./src/sockets/socketManager.js";
import { startCronJobs } from "./src/jobs/index.js";

// Initialize Express App
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Pass io instance to req for use in controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));
app.use((req, res, next) => {
  const logStr = `[REQ] ${req.method} ${req.url} from ${req.headers['user-agent']} body: ${JSON.stringify(req.body)}\n`;
  fs.appendFileSync('backend.log', logStr);
  next();
});
// Static files for CDN
const uploadsDir = process.env.UPLOADS_DIR || 'uploads';
app.use('/uploads', express.static(uploadsDir));

// Routes
app.use('/api/artist_app', artistAppRoutes);
app.use('/api/hiring_app', hiringAppRoutes);
app.use('/api/admin_panel', adminPanelRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/connections', connectionRoutes);
app.use('/api/professions', professionRoutes);
app.use('/api/comments', commentsRoutes);
// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Fameu Backend is running' });
});

// Global Error Handler
app.use(errorHandler);

// Socket.io Events
socketManager(io);

// Start Cron Jobs
startCronJobs();

// Start Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
