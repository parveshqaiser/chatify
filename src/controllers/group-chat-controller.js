

import mongoose from "mongoose";
import GroupMessageModel from "../models/group.message.model.js";
import GroupModel from "../models/group.model.js";

const sendMessageGroup = async(req, res)=>{
    try {
        let {groupId} = req.params;
        let loggedInUser = req.user.id;

        const { msg, type, file} = req.body;
       
        if (!msg || msg.trim().length === 0) {
            return res.status(400).json({
                message: "Message cannot be empty",
                success: false,
            });
        }

        let group = await GroupModel.findById(groupId);

        if(!group){
            return res.status(404).json({
                message : "Request Grooup Does not exist",
                success : false
            });
        }

        let messageData = {
            groupId,
            senderId : loggedInUser,
            type,
            text: msg?.trim() || null,
            file: file ? {
                url: file.url,
                key: file.key,
                fileName: file.fileName,
                mimeType: file.mimeType,
                size: file.size,
            } : null,
        };

        let create = await GroupMessageModel.create(messageData);

        group.lastMessageAt = Date.now();

        await group.save();

        // console.log("create ", create);

        res.status(201).json({
            message : "Message sent in group",
            success : true,
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong while sending message in  group.",
            success: false,
        });
    }
}

const fetchGroupMessage = async(req, res)=>{
    try {

        let {groupId} = req.params;

        // below i need to check whether the logged in user belong to taht group or not. 
        let allMessages = await GroupMessageModel.find({
            groupId ,
        }).populate("groupId").lean();

        res.status(200).json({
            message : "All Messages fetched",
            success : true,
            data : allMessages            
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong fetching the group.",
            success: false,
        });
    }
}

const editGroupMessage = async(req, res)=>{
    try {

        let {groupId,messageId} = req.params;
        let loggedInUser = req.user.id;

        const { msg, type, file} = req.body;
       
        if (!msg || msg.trim().length === 0) {
            return res.status(400).json({
                message: "Message cannot be empty",
                success: false,
            });
        }

        let group = await GroupModel.findById(groupId);

        if(!group){
            return res.status(404).json({
                message : "Request Grooup Does not exist",
                success : false
            });
        }

        let groupMesage = await GroupMessageModel.findById(messageId);

        if(!groupMesage){
            return res.status(404).json({
                message : "Message Id in group does not exist",
                success : false
            });
        }

        if(groupMesage.senderId.toString() !== loggedInUser.toString()){
            return res.status(400).json({
                message : "You are not allowed to edit others message",
                success : false
            });
        }

        groupMesage.text = msg;

        await groupMesage.save();

        res.status(200).json({
            message : "Message Edited",
            success : true
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong in editing message in the group.",
            success: false,
        });
    }
}

const deleteGroupMessage = async(req, res)=>{
    try {
        let {groupId,messageId} = req.params;
        let loggedInUser = req.user.id;

        let group = await GroupModel.findById(groupId);

        if(!group){
            return res.status(404).json({
                message : "Request Grooup Does not exist",
                success : false
            });
        }

        let groupMesage = await GroupMessageModel.findOneAndDelete({
            _id: messageId,
            senderId : loggedInUser
        });

        if(!groupMesage){
            return res.status(404).json({                
                message: "Message not found or you are not allowed to delete this message",
                success: false,
            });
        }

        res.status(200).json({
            message: "Message deleted successfully",
            success: true,            
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong in deleting message.",
            success: false,
        });
    }
}

export {
    sendMessageGroup,
    fetchGroupMessage,
    editGroupMessage,
    deleteGroupMessage
}