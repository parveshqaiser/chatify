
import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/send/:id", userAuthentication, sendMessage);


export default router;