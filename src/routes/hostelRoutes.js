import express from "express";
import multer from "multer";
import { verifyOwnerToken } from "../middleware/authMiddleware.js";


import {  getHostels, hydHostels, cheHostels, benHostels, getHostelById, addHostel, updateHostel  } from "../controllers/hostelController.js";

const router = express.Router();
const upload = multer();



router.get("/gethostels", getHostels);
router.get("/hydhostels", hydHostels);
router.get("/chehostels", cheHostels);
router.get("/benhostels", benHostels);
router.get("/:hostel_id", getHostelById);
router.put("/:hostel_id", updateHostel);  // <-- PUT endpoint

router.post("/addhostel", verifyOwnerToken, upload.none(), addHostel);
 


 

export default router;
