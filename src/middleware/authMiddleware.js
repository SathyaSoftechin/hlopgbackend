import jwt from "jsonwebtoken";

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
