require("dotenv").config();

const express = require("express");
const cors = require("cors");
const compression = require("compression");
const morgan = require("morgan");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const app = express();
const { PrismaClient } = require('./generated/prisma');

const catalogRoutes = require("./routes/catalog");

const PORT = process.env.PORT || 5000; // Fallback port
const NODE_ENV = process.env.NODE_ENV;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// Basic env validation
const requiredEnv = ["DATABASE_URL", "TMDB_API_KEY"];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn("Missing env vars:", missing.join(", "));
}

app.set('trust proxy', 1);

// Security and performance
app.use(helmet());
app.use(compression());
// Log only errors (4xx/5xx) or all in dev
app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode < 400 && NODE_ENV === 'production',
  })
);

// CORS
const allowedOrigins = [FRONTEND_URL, "http://localhost:5173"]; 
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      // Allow specific deployed frontend
      if (FRONTEND_URL && origin === FRONTEND_URL) return cb(null, true);
       // Allow standard localhost for dev
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "OPTIONS"], // Read-only API
  })
);

// Rate limit
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Reasonable limit for public catalog
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("ThiraiView Catalog API"));

// Mount Catalog Routes
app.use("/catalog", catalogRoutes);

// 404
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy violation" });
  }
  res.status(500).json({ error: "Internal server error" });
});

// Start server
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
    setTimeout(() => process.exit(1), 10000).unref();
  });
});

module.exports = app;
