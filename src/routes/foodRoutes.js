import express from "express";
import { foodMenu } from "../controllers/foodController.js";

const router = express.Router();
router.get("/:hostelId", foodMenu);
export default router;
