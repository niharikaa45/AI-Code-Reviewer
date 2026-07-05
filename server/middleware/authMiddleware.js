import jwt from "jsonwebtoken";
import User from "../models/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user
   const user = await User.findById(decoded.id || decoded._id).select("-password");

if (!user) {
  return res.status(401).json({
    success: false,
    message: "User not found"
  });
}

req.user = user;
next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};
import multer from "multer";

const storage = multer.memoryStorage();
export const upload = multer({ storage });

export default authMiddleware;