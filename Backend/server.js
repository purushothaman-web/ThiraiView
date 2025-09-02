require("dotenv").config(); // Load env vars before anything else

const express = require("express");
const cors = require("cors");
const app = express();

const moviesRouter = require("./routes/movies");
const loginRoute = require("./routes/login");
const registerRoute = require("./routes/register");
const reviewRouter = require("./routes/reviews");
const profileRoute = require("./routes/profile");
const watchlistRoutes = require("./routes/watchlist");
const verifyRoute = require("./routes/verify");
const resendVerification = require("./routes/resendVerification");

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || "development";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: "GET,POST,PUT,DELETE,PATCH",
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());

// Routes
app.get("/", (req, res) => res.send("Hello Movies"));
app.use("/movies", moviesRouter);
app.use("/login", loginRoute);
app.use("/register", registerRoute);
app.use("/reviews", reviewRouter);
app.use("/uploads", express.static("uploads"));
app.use("/profile", profileRoute);
app.use("/watchlist", watchlistRoutes);
app.use("/verify", verifyRoute);
app.use("/resend-verification", resendVerification);

// 🔹 404 Middleware (Route Not Found)
app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

// 🔹 500 Middleware (Internal Server Error)
app.use((err, req, res, next) => {
  console.error("Internal Server Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, (error) => {
  if (error) throw error;
  console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
});

module.exports = app;
