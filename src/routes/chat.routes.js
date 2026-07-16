
import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { getAllMessage, sendMessage } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/send/:id", userAuthentication, sendMessage);
router.get("/:id", userAuthentication, getAllMessage);


export default router;