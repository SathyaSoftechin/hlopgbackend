import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import axios from "axios";
import { User, Owner, Hostel, Visitor } from "../models/index.js";
import { Op } from "sequelize";


export const getPgs = async (req, res) => {
 
    try {
    const { ownerId } = req.params;

    const hostels = await Hostel.findAll({
      where: { owner_id: ownerId },
      attributes: ["hostel_id", "hostel_name"]    });

    return res.status(200).json({
      success: true,
      data: hostels,
    });
  } catch (err) {
    console.error("Error fetching owner PGs:", err);
    return res.status(500).json({
      success: false,
      message: "Server Error while fetching PGs",
    });
  }

};
