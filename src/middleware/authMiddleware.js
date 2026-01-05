import jwt from "jsonwebtoken";
import { Owner } from "../models/index.js";


export const authenticateUserToken = (req, res, next) => {
const authHeader = req.headers["authorization"];
const token = authHeader && authHeader.split(" ")[1];
if (!token) return res.status(401).json({ error: "No token provided" });

try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decoded; // ⚡ attach the user payload
  next();
} catch (err) {
  return res.status(403).json({ error: "Invalid token" });
}
};

export const verifyOwnerToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied. Token missing." });
    }

    const token = authHeader.split(" ")[1];

 
    // ✅ Verify token only
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded); // 🔍 Check what's actually inside


    // ✅ Attach owner data from token
    req.owner = {
      owner_id: decoded.user_id,
    };
    req.owner = decoded; // attach decoded token info

    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
 
};
