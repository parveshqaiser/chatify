

import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { sendNewMessage } from "../controllers/conversation.controller.js";

const router = express.Router();

router.put("/send/message/:targetUserId", userAuthentication, sendNewMessage);

export default router;