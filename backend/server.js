import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import { seedData } from './seed.js';
import { startBillingScheduler } from './jobs/billingScheduler.js';
import apiRouter from './routes/api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, '../dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    service: 'SmartSub Unified Subscription Management Backend',
    company: 'Brightloop Software',
    time: new Date().toISOString()
  });
});

// API routes
app.use('/api', apiRouter);

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, message: `Endpoint not found: ${req.method} ${req.originalUrl}` });
});

// Serve frontend static assets in production or if dist exists
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));

  // Client-side routing fallback for non-API routes (Express 5 compatible)
  app.use((req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]:', err.stack);
  res.status(500).json({ success: false, message: err.message || 'Internal server error.' });
});

// Start Server
async function startServer() {
  await connectDB();
  await seedData();
  startBillingScheduler();

  const server = app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  SmartSub Backend Server is running on port ${PORT}`);
    console.log(`  Company: Brightloop Software`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[SmartSub] Port ${PORT} already in use. Existing server process active.`);
    } else {
      console.error('[SmartSub Server Error]:', err);
    }
  });
}

startServer();

