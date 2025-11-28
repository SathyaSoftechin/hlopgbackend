import express from "express";
import pool from "../models/db.js";
import db, { sequelize, Sequelize, User, Owner, Hostel, FoodMenu } from "../models/index.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Get all users
router.get("/", verifyAdmin, async (req, res) => {
  const result = await sequelize.query("SELECT  id, name, email, phone FROM users WHERE user_type='user' ");
  res.json(result.rows);
});

// Delete user
router.delete("/:id", verifyAdmin, async (req, res) => {
  await sequelize.query("DELETE FROM users WHERE  id=$1", [req.params.id]);
  res.json({ message: "User deleted" });
});

export default router;
