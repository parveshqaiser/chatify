
import express from "express";
import userAuthentication from "../middlewares/auth.middleware.js";
import { 
    addMembers, createGroup, deleteGroup, 
    editGroup, fetchGroupDetails, removeMembers 
} from "../controllers/group.controller.js";
import uploadFile from "../middlewares/multer.middleware.js";
import isGroupAdmin from "../middlewares/group-admin.middleware.js";

let router = express.Router();

router.post("/", userAuthentication,uploadFile.single("image"), createGroup);
router.get("/", userAuthentication, fetchGroupDetails);
router.post("/:groupId/add-members", userAuthentication, isGroupAdmin, addMembers);
router.delete("/:groupId/remove-members/:userId", userAuthentication,isGroupAdmin, removeMembers);
router.delete("/:groupId", userAuthentication, isGroupAdmin, deleteGroup);
router.patch("/:groupId/edit", userAuthentication, isGroupAdmin, editGroup);


export default router;