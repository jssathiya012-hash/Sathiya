import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { seedData } from './seed.js';
import { startBillingScheduler } from './jobs/billingScheduler.js';
import apiRouter from './routes/api.js';

dotenv.config();

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

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`  SmartSub Backend Server is running on port ${PORT}`);
    console.log(`  Company: Brightloop Software`);
    console.log(`  Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

startServer();
