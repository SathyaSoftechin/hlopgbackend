import jwt from "jsonwebtoken";
import Owner from "../models/owner.js"; // adjust path if needed


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

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // optional: fetch user from DB
    const owner = await Owner.findByPk(decoded.owner_id);

    if (!owner) {
      return res.status(401).json({ error: "Invalid token owner" });
    }

    // attach user to request
    req.owner = owner;

    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
