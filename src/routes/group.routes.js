
import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { createGroup, fetchGroupDetails } from "../controllers/group.controller.js";
import uploadFile from "../middlewares/multer.middleware.js";

let router = express.Router();

router.post("/", userAuthentication,uploadFile.single("image"), createGroup);
router.get("/", userAuthentication, fetchGroupDetails);

export default router;