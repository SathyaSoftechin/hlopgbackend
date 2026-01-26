import express from "express";
 import { upload } from "../middleware/upload.js";

import { verifyOwnerToken, authenticateUserToken } from "../middleware/authMiddleware.js";


import {  getHostels, hydHostels, cheHostels, benHostels, getHostelById, addHostel, updateHostel,   } from "../controllers/hostelController.js";

const router = express.Router();
 


router.get("/gethostels", getHostels);
router.get("/hydhostels", hydHostels);
router.get("/chehostels", cheHostels);
router.get("/benhostels", benHostels);
// router.get("/liked-hostels", getLikedHostels);
// router.post("/like-hostel", likeHostel)
router.post("/addhostel", verifyOwnerToken, upload.array("images", 10), addHostel);
router.get("/:hostel_id", getHostelById);
router.put("/update/:hostel_id", verifyOwnerToken, upload.array("images", 10), updateHostel);  // <-- PUT endpoint 
 


export default router;
