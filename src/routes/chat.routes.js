
import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { 
    editMessage, 
    clearConversation,
    deleteMessage, 
    getAllMessage, 
    sendMessage, 
    } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/send/:targetUserId", userAuthentication, sendMessage);
router.get("/:targetUserId", userAuthentication, getAllMessage);
router.delete("/:targetUserId/message/:messageId", userAuthentication, deleteMessage);
router.delete("/:targetUserId", userAuthentication , clearConversation);
router.patch("/:targetUserId/message/:messageId", userAuthentication , editMessage);


export default router;