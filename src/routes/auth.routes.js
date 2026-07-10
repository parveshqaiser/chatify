import express from "express";
import { currentUser, updateProfile, userLogin, userLogout, userRegistration, verifyEmailToken } from "../controllers/auth.controller.js";
import userAuthentication from "../middlewares/auth.middleware.js";

let router = express.Router();

router.post("/register", userRegistration);
router.get("/verify-email/:verificationToken", verifyEmailToken);

router.post("/login", userLogin);
router.get("/logout",userAuthentication, userLogout);

router.get("/current-user", userAuthentication, currentUser);
router.patch("/update-profile", userAuthentication, updateProfile);

export default router;

