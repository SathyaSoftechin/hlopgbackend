import express from "express";
import {getPgs } from "../controllers/ownerControllers.js";
import verifyOwnerToken from "../middleware/authMiddleware.js"
 

const router = express.Router();
 
router.get("/owner/pgs", verifyOwnerToken, getPgs);





export default router;
