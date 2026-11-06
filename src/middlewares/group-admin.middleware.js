
import mongoose from "mongoose";

import GroupModel from "../models/group.model.js";

const isGroupAdmin = async(req, res, next)=>{
    try {
        
        let { groupId } = req.params;
        let loggedInUser = req.user.id;

        let group = await GroupModel.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: "Group not found"
            });
        }

        let isAdmin = group.members.some(item => item.userId.toString() == loggedInUser.toString() && item.role == "admin");
        if (!isAdmin) {
            return res.status(403).json({
                success: false,
                message: "Only group admins can perform this action"
            });
        }

        req.group = group;
        next();

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking group admin permissions",
            error: error.message
        });
    }
}

export default isGroupAdmin;