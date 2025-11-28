import express from "express";
import { getReviewsByHostel } from "../controllers/reviewController.js";

const router = express.Router();

// GET /reviews/:hostel_id
router.get("/:hostel_id", getReviewsByHostel);

export default router;
