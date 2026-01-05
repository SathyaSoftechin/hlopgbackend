import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { User, Owner, Hostel, Visitor } from "../models/index.js";
import { Op } from "sequelize";


export const getPgs = async (req, res) => {
  try {
    const ownerId = req.owner.user_id; // this comes from verifyOwnerToken middleware
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });

    const pgList = await Hostel.findAll({
      where: { owner_id: ownerId },
      order: [["created_at", "DESC"]],
    });

    res.json({ data: pgList });
  } catch (err) {
    console.error("Fetch owner PGs error:", err);
    res.status(500).json({ error: "Server error" });
  }
};