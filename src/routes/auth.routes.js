import express from "express";
import { 
    addSocialHandles,
    changeAvatar, currentUser, emergencyLogout, 
    fetchAllUsers, generateAccessToken, removeSocialHandles, updatePassword, updateProfile, 
    userLogin, userLogout, userRegistration, verifyEmailToken 
} from "../controllers/auth.controller.js";
import userAuthentication from "../middlewares/auth.middleware.js";
import uploadFile from "../middlewares/multer.middleware.js";

let router = express.Router();

router.post("/register", userRegistration);
router.get("/verify-email/:verificationToken", verifyEmailToken);

router.post("/login", userLogin);
router.get("/logout",userAuthentication, userLogout);
router.get("/emergency-logout", emergencyLogout);

router.post("/change-avatar", userAuthentication, uploadFile.single("avatar"),changeAvatar);

router.get("/current-user", userAuthentication, currentUser);
router.get("/allusers", userAuthentication, fetchAllUsers);
router.patch("/update-profile", userAuthentication, updateProfile);
router.post("/add-social-link", userAuthentication, addSocialHandles);
router.patch("/remove-social-link/:platform", userAuthentication, removeSocialHandles);

router.post("/change-password", userAuthentication,updatePassword);
router.get("/refresh-token", generateAccessToken);

export default router;

