const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");

const staticRoute = require("./routes/staticRoutes");
const authRoutes = require("./routes/auth");
const profileRoute = require("./routes/profile");
const postRoutes = require("./routes/posts");

const app = express();
const PORT = process.env.PORT || 3000;

// Load environment variables in non-production environments
if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

// Connect to MongoDB
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mini-project-1";
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Middleware
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/", staticRoute);
app.use("/auth", authRoutes);
app.use("/profile", profileRoute);
app.use("/post", postRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  res.status(500).send("Internal Server Error");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
