require("dotenv").config(); // Load env vars before anything else

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const app = express();
const cookieParser = require('cookie-parser');
const { PrismaClient } = require('./generated/prisma');
const bcrypt = require('bcryptjs');

const moviesRouter = require("./routes/movies");
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const reviewRouter = require("./routes/reviews");
const profileRoute = require("./routes/profile");
const watchlistRoutes = require("./routes/watchlist");
const verifyRoute = require("./routes/verify");
const resendVerification = require("./routes/resendVerification");
const authRoutes = require('./routes/auth');
const passwordResetRoutes = require('./routes/password-reset');
const followRoutes = require('./routes/follow');
const commentRoutes = require('./routes/comments');
const notificationRoutes = require('./routes/notifications');
const adminRoutes = require('./routes/admin');

const PORT = process.env.PORT;
const NODE_ENV = process.env.NODE_ENV;
const FRONTEND_URL = process.env.FRONTEND_URL;

// Basic env validation
const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "REFRESH_TOKEN_SECRET",
  "FRONTEND_URL",
  "APP_BASE_URL",
  "ASSETS_BASE_URL",
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_PASS",
  "EMAIL_FROM",
];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn("Missing env vars:", missing.join(", "));
}

app.set('trust proxy', 1); 

// Security and performance
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(compression());
// Log only errors (4xx/5xx), suppress normal request logs
app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode < 400,
  })
);

// CORS - Must be before rate limiting
const defaultAllowed = [FRONTEND_URL];
const allowedOrigins = (process.env.FRONTEND_URLS)
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean)
  .concat(defaultAllowed);

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    credentials: true,
  })
);

// Rate limit (general) - More lenient for development
const limiter = rateLimit({ 
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 10000 : 1000, // More lenient in dev
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// Stricter rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: NODE_ENV === 'development' ? 100 : 10, // 10 attempts per 15 min in prod
  message: { error: 'Too many authentication attempts, please try again later.' }
});

// Middleware to parse JSON
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => res.send("Hello Movies"));
app.use("/movies", moviesRouter);
app.use("/login", authLimiter, loginRoute);
app.use("/register", authLimiter, registerRoute);
app.use("/reviews", reviewRouter);
// Conditionally serve static files (only in development)
if (process.env.NODE_ENV !== 'production') {
  app.use("/uploads", cors({ origin: allowedOrigins, credentials: true }), express.static("uploads"));
}

// 🔹 Routes
app.use("/profile", profileRoute);
app.use("/watchlist", watchlistRoutes);
app.use("/verify", verifyRoute);
app.use("/resend-verification", authLimiter, resendVerification);
app.use('/auth', authLimiter, authRoutes);
app.use('/password-reset', authLimiter, passwordResetRoutes);
app.use('/follow', followRoutes);
app.use('/comments', commentRoutes);
app.use('/notifications', notificationRoutes);
app.use('/admin', adminRoutes);

// 🔹 404 Middleware (Route Not Found)
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// 🔹 500 Middleware (Internal Server Error)
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  
  // Handle CORS errors specifically
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy violation" });
  }
  
  res.status(500).json({ error: "Internal server error" });
});

// Prisma
const prisma = new PrismaClient();

// Start server with graceful shutdown
const server = app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
});

const signals = ["SIGINT", "SIGTERM"];
signals.forEach((sig) => {
  process.on(sig, () => {
    console.log(`Received ${sig}, shutting down gracefully...`);
    server.close(() => {
      console.log("HTTP server closed");
      process.exit(0);
    });
    // Force exit after 10s
    setTimeout(() => process.exit(1), 10000).unref();
  });
});

module.exports = app;
