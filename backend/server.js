const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
// const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ["JWT_SECRET", "MONGODB_URI"];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(
      `Error: Environment variable ${envVar} is required but not set`
    );
    process.exit(1);
  }
}

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration - must be before routes
const allowedOrigins = [
  "https://mern-project-syzh.vercel.app",
  "http://localhost:3000"
];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Body parsing middleware
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));

// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
// });
// app.use("/api/", limiter);

// Auth routes rate limiting
// const authLimiter = rateLimit({
//   windowMs: 60 * 60 * 1000, // 1 hour
//   max: 5, // limit each IP to 5 login/register requests per hour
// });
// app.use("/api/auth/", authLimiter);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/blog-platform")
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.log("MongoDB connection error:", err.message);
    console.log(
      "⚠️  Please make sure MongoDB is running locally, or update MONGODB_URI in .env"
    );
    console.log(
      "🔗 Download MongoDB: https://www.mongodb.com/try/download/community"
    );
  });

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/posts", require("./routes/blog"));
app.use("/api/comments", require("./routes/comments"));

// Basic route
app.get("/", (req, res) => {
  res.json({
    message: "Blog Platform API is running!",
    version: "1.0.0",
    endpoints: {
      auth: "/api/auth",
      posts: "/api/posts",
      comments: "/api/comments",
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Something went wrong!",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
});
