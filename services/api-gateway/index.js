import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createProxyMiddleware } from 'http-proxy-middleware';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { logger, ErrorCodes, errorHandler, AppError } from '@fresher-ai/shared';

dotenv.config();

const app = express();
const PORT = process.env.PORT || process.env.GATEWAY_PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Initialize Firebase Admin SDK (with demo fallback)
try {
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && !process.env.FIREBASE_PRIVATE_KEY.includes('...')) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    logger.info('Firebase Admin SDK initialized successfully with service credentials');
  } else {
    logger.info('Firebase Admin SDK running in local demo / permissive verification mode');
  }
} catch (err) {
  logger.warn(`Firebase Admin SDK init notice: ${err.message}. Operating in demo verification mode.`);
}

// Security & CORS Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

app.use(cors({
  origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id', 'x-user-email', 'x-user-name']
}));

// Standard rate limiter for all routes
const standardLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    code: ErrorCodes.RATE_LIMIT_EXCEEDED,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use(standardLimiter);

// Health Endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Authentication Middleware
const authenticateToken = async (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      code: ErrorCodes.UNAUTHORIZED,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  // 1. Support instant demo student token (1-click presentation capability)
  if (token.startsWith('mock_token_') || token.includes('demo_user')) {
    const uid = token.replace('mock_token_', '') || 'demo_user_harini_123';
    req.headers['x-user-id'] = uid;
    req.headers['x-user-email'] = 'harini.kisara@college.edu';
    req.headers['x-user-name'] = 'Kisara Harini';
    return next();
  }

  // 2. Real Firebase ID token verification
  try {
    if (admin.apps.length > 0) {
      const decodedToken = await admin.auth().verifyIdToken(token);
      req.headers['x-user-id'] = decodedToken.uid;
      req.headers['x-user-email'] = decodedToken.email || '';
      req.headers['x-user-name'] = decodedToken.name || decodedToken.email?.split('@')[0] || 'User';
      return next();
    } else {
      req.headers['x-user-id'] = 'demo_user_harini_123';
      req.headers['x-user-email'] = 'harini.kisara@college.edu';
      req.headers['x-user-name'] = 'Kisara Harini';
      return next();
    }
  } catch (err) {
    logger.warn(`Firebase Token verification failed: ${err.message}`);
    return res.status(401).json({
      success: false,
      code: ErrorCodes.UNAUTHORIZED,
      message: 'Invalid or expired authentication token.'
    });
  }
};

// Target Microservices URLs
const USER_SERVICE = process.env.USER_SERVICE_URL || 'http://localhost:5001';
const RESUME_SERVICE = process.env.RESUME_SERVICE_URL || 'http://localhost:5002';
const INTERVIEW_SERVICE = process.env.INTERVIEW_SERVICE_URL || 'http://localhost:5003';
const ROADMAP_SERVICE = process.env.ROADMAP_SERVICE_URL || 'http://localhost:5005';

// Attach Auth Middleware to all /api routes
app.use('/api', authenticateToken);

// Create Service Proxies
const makeProxy = (target) => createProxyMiddleware({
  target,
  changeOrigin: true,
  on: {
    proxyReq: (proxyReq, req) => {
      if (req.headers['x-user-id']) proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
      if (req.headers['x-user-email']) proxyReq.setHeader('x-user-email', req.headers['x-user-email']);
      if (req.headers['x-user-name']) proxyReq.setHeader('x-user-name', req.headers['x-user-name']);
    },
    error: (err, req, res) => {
      logger.error(`Proxy failure to target ${target}:`, err);
      if (!res.headersSent) {
        res.status(503).json({
          success: false,
          code: ErrorCodes.SERVICE_UNAVAILABLE,
          message: `Service at ${target} is currently unreachable. Please ensure it is running.`
        });
      }
    }
  }
});

const userProxy = makeProxy(USER_SERVICE);
const resumeProxy = makeProxy(RESUME_SERVICE);
const interviewProxy = makeProxy(INTERVIEW_SERVICE);
const roadmapProxy = makeProxy(ROADMAP_SERVICE);

// Route Dispatcher preserving exact path
app.use((req, res, next) => {
  const p = req.path;
  if (p.startsWith('/api/auth') || p.startsWith('/api/me') || p.startsWith('/api/dashboard')) {
    return userProxy(req, res, next);
  }
  if (p.startsWith('/api/resume')) {
    return resumeProxy(req, res, next);
  }
  if (p.startsWith('/api/interviews')) {
    return interviewProxy(req, res, next);
  }
  if (p.startsWith('/api/roadmaps')) {
    return roadmapProxy(req, res, next);
  }
  next();
});

// Central Gateway Error Handler
app.use(errorHandler);

// Start Gateway
app.listen(PORT, () => {
  logger.info(`Fresher.AI API Gateway running on port ${PORT}`);
  logger.info(`Proxying User -> ${USER_SERVICE}, Resume -> ${RESUME_SERVICE}, Interview -> ${INTERVIEW_SERVICE}, Roadmap -> ${ROADMAP_SERVICE}`);
});
