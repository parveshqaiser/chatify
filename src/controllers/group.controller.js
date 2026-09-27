import mongoose from "mongoose";
import GroupModel from "../models/group-chat.model.js";
import cloudinary from "../services/cloudinary.service.js";
import { Readable } from "node:stream";
import path from "node:path";

// backend validation in this controller is pending
const createGroup = async(req, res)=>{

    let uploadedPublicId= null;

    try {
        let loggedInUser = req.user.id; // sender id

        let file = req.file;
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

        let avatar = {
            publicId: result?.public_id || null,
            url: result?.secure_url || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyMhkU6ImpYVLj4XSVXbVg3z-A3a1hmdeZ4IF3ja-gwQ&s=10",
            createdAt: result?.created_at  || null
        };

        let group = await GroupModel.create({
            avatar,
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

export {
    createGroup
}