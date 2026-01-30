import express from "express";
import { registerUser, loginUser, updateBasicInfo, changePassword, registerOwner, loginOwner,  verifyOtp, resendOTP ,verifyOwner,  verifyUser, getUserById, getOwnerById} from "../controllers/authController.js";
import { authenticateUserToken, verifyOwnerToken } from "../middleware/authMiddleware.js";
import { getUserPgUpdates } from "../controllers/pgUpdateController.js";


const router = express.Router();


router.post("/registeruser", registerUser);
router.post("/loginuser", loginUser);
router.post("/registerowner", registerOwner);
router.post("/loginowner",  loginOwner);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOTP);
router.get("/user", verifyUser);
router.get("/owner", verifyOwner);
router.put("/update-basic-info", authenticateUserToken, updateBasicInfo);
router.put("/change-password", authenticateUserToken, changePassword);
router.get("/pg-updates", authenticateUserToken, getUserPgUpdates);



router.get("/userid", authenticateUserToken, getUserById); // ✅ logged-in user
router.get("/ownerid", verifyOwnerToken, getOwnerById); // ✅ logged-in user





export default router;
