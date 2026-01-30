import express from "express";
import {getPgs, getMembersInToday, getMembersOutToday } from "../controllers/ownerControllers.js";
import { createPgUpdate } from "../controllers/pgUpdateController.js";

import {verifyOwnerToken} from "../middleware/authMiddleware.js"
 

const router = express.Router();
 
router.get("/pgs", verifyOwnerToken, getPgs);
router.get("/members-in", verifyOwnerToken, getMembersInToday);
router.get("/members-out", verifyOwnerToken, getMembersOutToday);
router.post("/pg-update", verifyOwnerToken, createPgUpdate);






export default router;
