
import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { 
    clearConversation,
    deleteMessage, 
    getAllMessage, 
    sendMessage, 
    } from "../controllers/chat.controller.js";

const router = express.Router();

router.post("/send/:id", userAuthentication, sendMessage);
router.get("/:id", userAuthentication, getAllMessage);
router.delete("/:id/:msgId", userAuthentication, deleteMessage);
router.delete("/:id", userAuthentication , clearConversation);


export default router;