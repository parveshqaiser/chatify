
import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { createGroup } from "../controllers/group.controller.js";

let router = express.Router();

router.post("/", userAuthentication, createGroup);

export default router;