import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { User, Booking, Owner, Hostel, Visitor } from "../models/index.js";
import { Op } from "sequelize";

 
 

export const getPgs = async (req, res) => {
  try {
    const ownerId = req.owner.owner_id; // this comes from verifyOwnerToken middleware
    if (!ownerId) return res.status(401).json({ error: "Unauthorized" });
    console.log("owner is", ownerId);

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

export const getMembersInToday = async (req, res) => {
  try {
    const ownerId = req.owner.owner_id; // this comes from verifyOwnerToken middleware

    // Today (YYYY-MM-DD)
    const today = new Date().toISOString().split("T")[0];

     // 1️⃣ Owner PGs
    const hostels = await Hostel.findAll({
      where: { owner_id: ownerId },
      attributes: ["hostel_id", "hostel_name"],
    });

    if (!hostels.length) {
      return res.json({ data: [] });
    }

    const hostelIds = hostels.map(h => h.hostel_id);

    // 2️⃣ Today confirmed bookings
    const bookings = await Booking.findAll({
      where: {
        hostel_id: hostelIds,
        date: today,
      },
      include: [
        { model: User, as: "user", attributes: ["phone", "name"] },
        { model: Hostel, as: "hostel", attributes: ["hostel_name"] },
      ],
      order: [["createdAt", "DESC"]],
    });

    // 3️⃣ Shape response
    const membersIn = bookings.map(b => ({
      phone: b.user.phone,          // ✅ PHONE SENT
      name: b.user.name,
      pgName: b.hostel.hostel_name,
      shareType: b.sharing,
    }));

    res.json({ data: membersIn });
  } catch (err) {
    console.error("Members IN error:", err);
    res.status(500).json({ message: "Failed to fetch members" });
  }
};




export const getMembersOutToday = async (req, res) => {
  try {
    const ownerId = req.owner.owner_id; // this comes from verifyOwnerToken middleware
    const today = new Date().toISOString().split("T")[0];

    // 1️⃣ Get owner hostels
    const hostels = await Hostel.findAll({
      where: { owner_id: ownerId },
      attributes: ["hostel_id", "hostel_name"],
    });

    const hostelIds = hostels.map(h => h.hostel_id);
    if (hostelIds.length === 0) return res.json([]);

    // 2️⃣ Find bookings where vacateDate is today
    const bookings = await Booking.findAll({
      where: {
        hostel_id: { [Op.in]: hostelIds },
        vacateDate: today,  // ✅ vacateDate filter
       },
      include: [
        {
          model: User,
          as: "user",
          attributes: ["phone", "name"],
        },
        {
          model: Hostel,
          as: "hostel",
          attributes: ["hostel_name"],
        },
      ],
    });

    // 3️⃣ Shape response
    const membersOut = bookings.map(b => ({
      phone: b.user.phone,
      name: b.user.name,
      pgName: b.hostel.hostel_name,
      shareType: b.sharing,
    }));

    res.json(membersOut);
  } catch (err) {
    console.error("Members OUT error:", err);
    res.status(500).json({ message: "Failed to fetch members out" });
  }
};