import express from "express";
import pool from "../models/db.js";
import db, { sequelize, Sequelize, User, Owner, Hostel, FoodMenu } from "../models/index.js";
import { verifyAdmin } from "../middleware/adminAuth.js";

const router = express.Router();

// Get all Bookings

router.get("/", verifyAdmin, async (req, res) => {
 const result = await sequelize.query(
      `SELECT 
        b.id,
        u.name AS user_name,
        u.phone AS user_phone,
        h.name AS hostel_name,
         r.sharing_type AS sharing_type,
        b.check_in,
        b.status
        FROM bookings b
        LEFT JOIN users u ON b.user_id = u.id
        LEFT JOIN hostels h ON b.hostel_id = h.id
        LEFT JOIN rooms r ON b.room_id = r.id
        ORDER BY b.id DESC;
`
    );  res.json(result.rows);
 
});

// Cancel booking
router.put("/bookings/:id/cancel", async (req, res) => {
  try {
    const result = await sequelize.query(
      "UPDATE bookings SET status = 'cancelled' WHERE booking_id = $1 RETURNING *",
      [req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error("Booking CANCEL error:", err.message);
    res.status(500).send("Server error");
  }
});



export default router;


