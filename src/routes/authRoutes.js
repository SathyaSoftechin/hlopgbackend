import express from "express";
import { registerUser, loginUser, registerOwner, loginOwner,  verifyOtp, resendOTP ,verifyOwner,  verifyUser, getUserById, getOwnerById} from "../controllers/authController.js";
import { authenticateUserToken, updateBasicInfo, verifyOwnerToken } from "../middleware/authMiddleware.js";


const router = express.Router();


router.post("/registeruser", registerUser);
router.post("/loginuser", loginUser);
router.post("/registerowner", registerOwner);
router.post("/loginowner",  loginOwner);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOTP);
router.get("/user", verifyUser);
router.get("/owner", verifyOwner);
router.put("/update-basic-info", authMiddleware, updateBasicInfo);

router.get("/userid", authenticateUserToken, getUserById); // ✅ logged-in user
router.get("/ownerid", verifyOwnerToken, getOwnerById); // ✅ logged-in user





export default router;
