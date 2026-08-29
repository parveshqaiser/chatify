

import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import ConversationModel from "../models/conversation.model.js";
import { generateUploadUrl } from "../services/aws.service.js";
import MessageModel from "../models/message.model.js";

const getUploadUrl = async (req, res) => {
    try {
        const { fileName, fileType } = req.body;

        if (!fileName || !fileType) {
            return res.status(400).json({
                success: false,
                message: "fileName and fileType are required",
            });
        }

        const { uploadUrl, key } = await generateUploadUrl(
            fileName,
            fileType
        );

        console.log("uploadUrl ", uploadUrl);
        console.log("key ******** ", key);

        res.status(200).json({
            success : true,
            uploadUrl,
            key,
        });


    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate upload URL",
        });
    }
};

let sendNewMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId} = req.params;

        let {msg} = req.body;

        if (!msg || msg.trim().length === 0) {
            return res.status(400).json({
                message: "Message cannot be empty",
                success: false,
            });
        }

        let user = await UserModel.findOne({_id:targetUserId, isEmailVerified:true});

        if(!user){
            return res.status(404).json({
                message : "Target User does not exist",
                status : false
            });
        }

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let chat = await ConversationModel.findOne({
            participants: {
                $all: [loggedInUser, targetUserId]
            }
        });

        if (!chat) {
            chat = await ConversationModel.create({
                participants: [loggedInUser, targetUserId]
            });
        }

        await MessageModel.create({
            chatId : chat._id.toString(),
            senderId : loggedInUser.toString(),
            receiverId : targetUserId.toString(),
            type : "text",
            text : msg,
            file : null
        });

        res.status(201).json({
            message : "Message sent",
            success : true,
        });

    } catch (error) {
        console.log("error ******* ", error)
        res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
}

let getAllMessage = async (req, res)=>{
    try {
        
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
}

export {getUploadUrl ,sendNewMessage};