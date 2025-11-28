// routes/adminAuth.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import pool from "../models/db.js";
import db, { sequelize, Sequelize, User, Owner, Hostel, FoodMenu } from "../models/index.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await sequelize.query("SELECT * FROM admins WHERE username=$1", [username]);
    if (result.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const admin = result.rows[0];
    const valid = await bcrypt.compare(password, admin.password_hash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ admin_id: admin.admin_id, role: "admin" }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

export default router;
