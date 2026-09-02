import express from "express";
import { authenticate } from "../middleware/index.js";
import { asyncHandler } from "../utils/index.js";
import {
  verifyOtp,
  resendOtp,
  forgotPassword,
  resetPassword,
  setupTwoFactor,
  verifyAndEnableTwoFactor,
  disableTwoFactor,
  validateTwoFactorChallenge,
  changePassword,
} from "../controllers/authSecurityController.js";

const router = express.Router();

// Public auth endpoints
router.post("/verify-otp", asyncHandler(verifyOtp));
router.post("/resend-otp", asyncHandler(resendOtp));
router.post("/forgot-password", asyncHandler(forgotPassword));
router.post("/reset-password", asyncHandler(resetPassword));
router.post("/2fa/validate-challenge", asyncHandler(validateTwoFactorChallenge));

// Authenticated security settings endpoints
router.post("/2fa/setup", authenticate, asyncHandler(setupTwoFactor));
router.post("/2fa/enable", authenticate, asyncHandler(verifyAndEnableTwoFactor));
router.post("/2fa/disable", authenticate, asyncHandler(disableTwoFactor));
router.post("/change-password", authenticate, asyncHandler(changePassword));

export default router;
