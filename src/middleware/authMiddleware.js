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

export const verifyOwnerToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.user_type !== "owner") {
      return res.status(403).json({ error: "Owners only" });
    }

    // 🔥 THIS LINE IS REQUIRED
    req.owner = { owner_id: decoded.user_id };

    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
