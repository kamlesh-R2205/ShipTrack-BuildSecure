require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const driverRoutes = require('./routes/drivers');
const adminRoutes = require('./routes/admin');
const securityRoutes = require('./routes/security');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shiptrack';

// 1. Defensive HTTP Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By'); // Avoid revealing Express / Node.js signature
  next();
});

// 2. CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or server-to-server)
      // or from whitelisted origins, or any localhost development port
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)
      ) {
        return callback(null, true);
      }
      callback(new Error('Blocked by CORS security policy.'));
    },
    credentials: true,
  })
);

// 3. Body parsers with defensive size constraints (prevents memory allocation DOS)
app.use(express.json({ limit: '100kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// 4. Rate Limiting: 200 requests per 15 minutes per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many requests from this IP address. Please try again later.',
  },
});
app.use('/api/', apiLimiter);

// 5. Mount API Routes
app.use('/api/auth', authRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/security', securityRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    timestamp: new Date().toISOString(),
  });
});

// Serve frontend build if dist folder exists
const fs = require('fs');
const path = require('path');
const distPath = path.resolve(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// 6. 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Database Connection & Server Initialization
async function connectDatabase(uri = MONGODB_URI) {
  try {
    await mongoose.connect(uri);
    console.log(`[DATABASE] Connected successfully to MongoDB at ${uri}`);
  } catch (err) {
    console.error('[DATABASE_ERROR] Failed to connect to MongoDB:', err.message);
    throw err;
  }
}

if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`[SHIPTRACK] Server listening on http://localhost:${PORT}`);
        console.log(`[SECURITY] Defense-in-depth middleware active.`);
      });
    })
    .catch((err) => {
      console.error('[FATAL] Server bootstrap terminated:', err.message);
    });
}

module.exports = {
  app,
  connectDatabase,
};
