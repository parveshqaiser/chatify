

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

        let singleGroup = await GroupMessageModel.findOne({groupId}).populate("groupId");

        res.status(200).json({
            message : "Details fetched",
            success : true,
            data : singleGroup            
        });

    } catch (error) {
        return res.status(500).json({
            message: error.message || "Something went wrong fetching the group.",
            success: false,
        });
    }
}


export {
    sendMessageGroup,
    fetchGroupMessage
}