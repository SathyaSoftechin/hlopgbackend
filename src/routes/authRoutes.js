import express from "express";
import { registerUser, loginUser, registerOwner, loginOwner, verifyOtp, resendOTP ,verifyOwner,  verifyUser, getUserById, getOwnerById} from "../controllers/authController.js";
import { authenticateUserToken } from "../middleware/authMiddleware.js";


const router = express.Router();


router.post("/registeruser", registerUser);
router.post("/loginuser", loginUser);
router.post("/registerowner", registerOwner);
router.post("/loginowner",  loginOwner);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOTP);
router.get("/user", verifyUser);
router.get("/owner", verifyOwner);

router.get("/userid", authenticateUserToken, getUserById); // ✅ logged-in user
router.get("/ownerid", authenticateUserToken, getOwnerById); // ✅ logged-in user





export default router;
