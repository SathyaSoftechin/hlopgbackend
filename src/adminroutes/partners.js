import express from "express";
import pool from "../models/db.js";
import db, { sequelize, Sequelize, User, Owner, Hostel, FoodMenu } from "../models/index.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

 
// Get all partners
router.get("/", verifyAdmin, async (req, res) => {
 try {
    const result = await sequelize.query("SELECT * FROM users WHERE user_type='partner'");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

  
 
// ✅ Add new partner
router.post("/", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const result = await sequelize.query(
      "INSERT INTO users (name, email, phone) VALUES ($1, $2, $3) RETURNING *",
      [name, email, phone]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Update partner
router.put("/:id", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const result = await sequelize.query(
      "UPDATE users SET name=$1, email=$2, phone=$3 WHERE  id=$4 RETURNING *",
      [name, email, phone, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Delete partner
router.delete("/:id", async (req, res) => {
  try {
    await sequelize.query("DELETE FROM users WHERE partner_id=$1", [req.params.id]);
    res.json({ message: "Partner deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
