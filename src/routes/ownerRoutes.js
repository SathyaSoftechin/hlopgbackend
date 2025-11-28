import express from "express";
import {getPgs } from "../controllers/ownerControllers.js";
 

const router = express.Router();
 
router.get("/pgs/:ownerId", getPgs);





export default router;
