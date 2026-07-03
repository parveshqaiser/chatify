import express from "express";
import { userRegistration } from "../controllers/auth.controller.js";

let router = express.Router();

router.post("/register", userRegistration);
// router.post("/login")

export default router;

