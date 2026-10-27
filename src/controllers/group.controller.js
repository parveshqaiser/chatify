
import mongoose from "mongoose";
import GroupModel from "../models/group-chat.model.js";
import cloudinary from "../services/cloudinary.service.js";
import { Readable } from "node:stream";
import UserModel from "../models/user.model.js";

// backend validation in this controller is pending
const createGroup = async(req, res)=>{

    let uploadedPublicId= null;

    try {
        let loggedInUser = req.user.id; // sender id

        let {groupName, members, description }= req.body;
        
        members = JSON.parse(members);
        
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

        let result = null;
        if(req.file !== undefined){
            result = await new Promise((resolve, reject) => {
                let uploadStream = cloudinary.uploader.upload_stream(
                    {folder: "group-photo" },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );    
                Readable.from(req.file.buffer).pipe(uploadStream);
            });
        }

        uploadedPublicId = result?.public_id;

        let groupAvatar = {
            publicId: result?.public_id || null,
            url: result?.secure_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyMhkU6ImpYVLj4XSVXbVg3z-A3a1hmdeZ4IF3ja-gwQ&s=10",
            createdAt: result?.created_at  || null
        };

        let group = await GroupModel.create({
            groupAvatar,
            groupName,
            members,
            description,
            createdBy : loggedInUser,
            admins : [loggedInUser]
        });

        res.status(201).json({
            message : "Group Created",
            success : true
        });

    } catch (error) {

        if (uploadedPublicId) {
            cloudinary.uploader.destroy(uploadedPublicId).catch((err) => {
                console.error("Rollback failed to delete new image:", err.message);
            });
        }

        return res.status(500).json({ 
            message: "Some Issue in Creating Group", 
            error: error.message, 
            success: false 
        });
    }
}

// fetch all group (only those where user is present )
const fetchGroupDetails = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // logged in user

        let groups = await GroupModel.find({
            $or : [
                {createdBy : loggedInUser}, 
                {"members.userId" : loggedInUser}
            ]
        }).populate({path: "members.userId",select: "avatar username name"});

        res.status(200).json({
            message : "Group Details Fetched",
            success : true,
            data : groups
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in fetching group details", 
            error: error.message, 
            success: false 
        });
    }
}

// as of now adding as single/ individual member  & not multiple
const addMembers = async (req, res)=> {
    try {
       
        let group = req.group;
        let { userId } = req.body;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        let user = await UserModel.findById(userId).select("username");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,               
            });
        }

        let alreadyMember = group.members.some(
            member => member.userId.toString() === userId
        );

        if (alreadyMember) {
            return res.status(409).json({
                message: "User is already a group member",
                 success: false,
            });
        }

        group.members.push({
            userId: user._id,
            username: user.username
        });

        await group.save();

        return res.status(200).json({
            success: true,
            message: "Member added successfully",
            data: group
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in Adding Member Group", 
            error: error.message, 
            success: false 
        });
    }
}

// remove members by admin only
const removeMembers = async(req, res)=>{
    try {
        let group = req.group;
        let { userId } = req.body;

         if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        let user = await UserModel.findById(userId).select("username");

        if (!user) {
            return res.status(404).json({
                message: "User not found",
                success: false,               
            });
        }

        let isMember = group.members.some(
            member => member.userId.toString() === userId
        );

        if (!isMember) {
            return res.status(404).json({
                message: "User Not a member in this Group",
                success: false,
            });
        }

        let isAdmin = group.admins.some(
            id => id.toString() === userId
        );

        if (isAdmin && group.admins.length === 1) {
            return res.status(400).json({
                success: false,
                message: "Cannot remove the last group admin"
            });
        }

        group.members.pull({
            userId: new mongoose.Types.ObjectId(userId)
        });

        // Also remove admin privileges if applicable.
        group.admins.pull(userId);

        await group.save();

        res.status(200).json({
            success: true,
            message: "Member removed successfully",
            data: group
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in Removing Group Member", 
            error: error.message, 
            success: false 
        });
    }
}

// delete group
const deleteGroup = async(req, res)=>{
    try {
        let groupId = req.group._id;

        await GroupModel.findOneAndDelete(groupId);

        // once conversation for that group starts, i need to delete all the conversation of that collection 
        res.status(200).json({
            message : "Group Deleted",
            success : true
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in Deleting Group", 
            error: error.message, 
            success: false 
        });
    }
}

// edit group
const editGroup = async(req, res)=>{
    try {
        let {groupName, description} = req.body;
        let group = req.group;

        if (!groupName?.trim()) {
            return res.status(400).json({
                message: "Group name is required",
                success: false,
            });
        }

        group.groupName = groupName;
        group.description = description || "";

        await group.save();

        res.status(200).json({
            message : "Group Updated",
            success : true
        });

    } catch (error) {
        return res.status(500).json({ 
            message: "Some Issue in Deleting Group", 
            error: error.message, 
            success: false 
        });
    }
}

export {
    createGroup,
    addMembers,
    removeMembers,
    deleteGroup,
    fetchGroupDetails,
    editGroup
}