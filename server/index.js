// Load local .env only in non-production environments to avoid overriding container environment variables
if (process.env.NODE_ENV !== 'production') {
  try {
    require('dotenv').config();
  } catch (e) {
    // Ignore missing dotenv
  }
}

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const shipmentRoutes = require('./routes/shipments');
const driverRoutes = require('./routes/drivers');
const adminRoutes = require('./routes/admin');
const securityRoutes = require('./routes/security');
const guardRoutes = require('./routes/guard');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

/**
 * Robust MongoDB connection URI resolver:
 * 1. process.env.MONGODB_URI
 * 2. process.env.MONGO_URI
 * 3. process.env.DATABASE_URL / MONGODB_URL / MONGO_URL
 * 4. Local fallback strictly for development only
 */
function resolveMongoUri() {
  const candidates = [
    { key: 'MONGODB_URI', val: process.env.MONGODB_URI },
    { key: 'MONGO_URI', val: process.env.MONGO_URI },
    { key: 'DATABASE_URL', val: process.env.DATABASE_URL },
    { key: 'MONGODB_URL', val: process.env.MONGODB_URL },
    { key: 'MONGO_URL', val: process.env.MONGO_URL },
  ];

  for (const item of candidates) {
    if (typeof item.val === 'string') {
      const cleaned = item.val.trim().replace(/^["']|["']$/g, '');
      if (cleaned.length > 0 && (cleaned.startsWith('mongodb://') || cleaned.startsWith('mongodb+srv://'))) {
        return { uri: cleaned, source: item.key };
      }
    }
  }

  const isProduction =
    process.env.NODE_ENV === 'production' ||
    Boolean(process.env.RENDER) ||
    Boolean(process.env.RENDER_SERVICE_ID);

  if (isProduction) {
    throw new Error(
      'Production configuration error: Missing cloud MongoDB connection string. Checked MONGODB_URI and MONGO_URI. Refusing fallback to 127.0.0.1 in production.'
    );
  }

  return { uri: 'mongodb://127.0.0.1:27017/shiptrack', source: 'local_fallback' };
}

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
      // or from whitelisted origins, localhost development ports, vercel preview, or onrender domains
      if (
        !origin ||
        allowedOrigins.includes(origin) ||
        /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin) ||
        (process.env.CLIENT_URL && origin.startsWith(process.env.CLIENT_URL)) ||
        /\.vercel\.app$/.test(origin) ||
        /\.onrender\.com$/.test(origin) ||
        /\.trycloudflare\.com$/.test(origin)
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
app.use('/api/guard', guardRoutes);

// Health check endpoints (both root and /api for load balancers and reverse proxies)
const healthHandler = (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'ShipTrack Guard Control Plane',
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'DISCONNECTED',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

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
async function connectDatabase(explicitUri) {
  const { uri, source } = explicitUri
    ? { uri: explicitUri, source: 'explicit' }
    : resolveMongoUri();

  try {
    console.log(`[DATABASE] Connecting to MongoDB (source: ${source})...`);
    await mongoose.connect(uri, {
      dbName: 'shiptrack',
      serverSelectionTimeoutMS: 15000,
    });
    console.log('[DATABASE] Connected successfully to MongoDB.');
  } catch (err) {
    const safeError = err.message
      ? err.message.replace(/:([^:@]+)@/, ':****@')
      : 'Connection error';
    console.error('[DATABASE_ERROR] Failed to connect to MongoDB:', safeError);
    throw new Error(`MongoDB connection failed: ${safeError}`);
  }
}

if (require.main === module) {
  connectDatabase()
    .then(() => {
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`[SHIPTRACK] Server listening on http://0.0.0.0:${PORT} (port ${PORT})`);
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
