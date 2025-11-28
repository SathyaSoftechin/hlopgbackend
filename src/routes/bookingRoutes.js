import express from "express";
import { newBooking, confirmBooking,  getUserBookings, getBookingsByHostelId} from "../controllers/bookingController.js";
import { authenticateUserToken } from "../middleware/authMiddleware.js";
''
const router = express.Router();
router.post("/newbooking", newBooking);
router.post("/confirm-booking", confirmBooking);
router.get("/getUserBookings", authenticateUserToken, getUserBookings )
router.get("/pg/:hostelId", getBookingsByHostelId);


export default router;
