import express from "express";
import { bulkCreateRooms, getRoomsByHostel, updateRoomsByHostel, saveRoomsByHostel  } from "../controllers/roomController.js";

const router = express.Router();

router.post("/bulkCreate", bulkCreateRooms);

router.get("/:hostel_id", getRoomsByHostel);
router.put("/:hostel_id", updateRoomsByHostel);
router.put("/:hostel_id", updateRoomsByHostel);
router.put("/save/:hostel_id", saveRoomsByHostel);          

export default router;
