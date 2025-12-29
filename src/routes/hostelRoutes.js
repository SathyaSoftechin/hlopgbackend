import express from "express";
import multer from "multer";
import { verifyOwnerToken, authenticateUserToken } from "../middleware/authMiddleware.js";


import {  getHostels, hydHostels, cheHostels, benHostels, getHostelById, addHostel, updateHostel, toggleLikeHostel, getLikedHostels   } from "../controllers/hostelController.js";

const router = express.Router();
const upload = multer();



router.get("/gethostels", getHostels);
router.get("/hydhostels", hydHostels);
router.get("/chehostels", cheHostels);
router.get("/benhostels", benHostels);
router.get("/:hostel_id(\\d+)", getHostelById);
router.put("/:hostel_id", updateHostel);  // <-- PUT endpoint
router.post("/like-hostel", authenticateUserToken, toggleLikeHostel);
router.get("/liked-hostels", authenticateUserToken, getLikedHostels);


router.post("/addhostel", verifyOwnerToken, upload.none(), addHostel);
 


 

export default router;
