import mongoose from "mongoose";
import GroupModel from "../models/group-chat.model.js";

// backend validation in this controller is pending
const createGroup = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id

        let file = req.file;
        let {groupName, members, description }= req.body;
        
        if (!groupName?.trim()) {
            return res.status(400).json({
                message: "Group name is required",
                success: false,
            });
        }

        if (!Array.isArray(members) || members.length <=1) {
            return res.status(400).json({
                message: "At least one member is required",
                success: false,
            });
        }

        let group = await GroupModel.create({
            groupName,
            members,
            description,
            createdBy : loggedInUser,
            admins : [loggedInUser]
        });

        // console.log("group ", group)

        res.status(201).json({
            message : "Group Created",
            success : true
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in Creating Group", 
            error: error.message, 
            success: false 
        });
    }
}

export {
    createGroup
}