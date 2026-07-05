import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import User from "./models/User.js";

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();
console.log(User.modelName);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});

process.on("uncaughtException", (err) => {
  console.log("UNCAUGHT ERROR:", err);
});