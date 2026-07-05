import express from "express";
import { userLogin, userRegistration } from "../controllers/auth.controller.js";

let router = express.Router();

router.post("/register", userRegistration);
router.post("/login", userLogin);

export default router;

