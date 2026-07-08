import express from "express";
import { userLogin, userLogout, userRegistration, verifyEmailToken } from "../controllers/auth.controller.js";
import userAuthentication from "../middlewares/auth.middleware.js";

let router = express.Router();

router.post("/register", userRegistration);
router.get("/verify-email/:verificationToken", verifyEmailToken);

router.post("/login", userLogin);
router.get("/logout",userAuthentication, userLogout);

export default router;

