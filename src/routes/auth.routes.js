import express from "express";
import { currentUser, emergencyLogout, fetchAllUsers, generateAccessToken, updatePassword, updateProfile, userLogin, userLogout, userRegistration, verifyEmailToken } from "../controllers/auth.controller.js";
import userAuthentication from "../middlewares/auth.middleware.js";

let router = express.Router();

router.post("/register", userRegistration);
router.get("/verify-email/:verificationToken", verifyEmailToken);

router.post("/login", userLogin);
router.get("/logout",userAuthentication, userLogout);
router.get("/emergency-logout", emergencyLogout);

router.get("/current-user", userAuthentication, currentUser);
router.get("/allusers", userAuthentication, fetchAllUsers);
router.patch("/update-profile", userAuthentication, updateProfile);

router.post("/change-password", userAuthentication,updatePassword);
router.get("/generate/access-token", generateAccessToken);

export default router;

