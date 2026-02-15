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

const PORT = process.env.PORT || 5000; 
const NODE_ENV = process.env.NODE_ENV;
const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");

// Basic env validation
const requiredEnv = ["DATABASE_URL", "TMDB_API_KEY"];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.warn("Missing env vars:", missing.join(", "));
}

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(
  morgan("combined", {
    skip: (req, res) => res.statusCode < 400 && NODE_ENV === 'production',
  })
);

const allowedOrigins = [FRONTEND_URL, "http://localhost:5173"]; 
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const normalizedOrigin = origin.replace(/\/$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) return cb(null, true);
      
      if (FRONTEND_URL && normalizedOrigin === FRONTEND_URL) return cb(null, true);
      
      if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') return cb(null, true);
      
      console.warn(`Blocked CORS origin: ${origin}`);
      return cb(new Error("Not allowed by CORS"));
    },
    methods: ["GET", "OPTIONS"], 
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 500, 
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

app.use(express.json());

app.get("/", (req, res) => res.send("ThiraiView Catalog API"));

app.use("/catalog", catalogRoutes);

app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  if (err.message === "Not allowed by CORS") {
    return res.status(403).json({ error: "CORS policy violation" });
  }
  res.status(500).json({ error: "Internal server error" });
});

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
