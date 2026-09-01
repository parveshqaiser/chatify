

import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { clearAllConversation, deleteMessage, editMessage, getAllMessage, getUploadUrl, sendNewMessage } from "../controllers/conversation.controller.js";

const router = express.Router();

router.post("/send/message/:targetUserId",userAuthentication, sendNewMessage); //for sending text message
router.post("/upload/file", getUploadUrl);

router.get("/:targetUserId", userAuthentication, getAllMessage);
router.delete("/:targetUserId/message/:messageId", userAuthentication, deleteMessage);
router.delete("/:targetUserId", userAuthentication , clearAllConversation);
router.patch("/:targetUserId/message/:messageId", userAuthentication , editMessage);

export default router;