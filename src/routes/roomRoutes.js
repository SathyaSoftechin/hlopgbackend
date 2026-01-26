import express from "express";
import { saveHostelRooms, getHostelRooms  } from "../controllers/roomController.js";

const router = express.Router();

router.post("/hostel-rooms", saveHostelRooms);

router.get("/:hostel_id", getHostelRooms);
// router.put("/:hostel_id", updateRoomsByHostel);
// router.put("/:hostel_id", updateRoomsByHostel);
// router.put("/save/:hostel_id", saveRoomsByHostel);          

export default router;
