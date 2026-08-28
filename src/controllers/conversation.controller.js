

import mongoose from "mongoose";
import UserModel from "../models/user.model.js";
import ConversationModel from "../models/conversation.model.js";
import { generateUploadUrl } from "../services/aws.service.js";

 let sendNewMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId} = req.params;

        const { fileName, fileType } = req.body;

        const { uploadUrl, key } = await generateUploadUrl(
            fileName,
            fileType
        );

        console.log("uploadUrl ", uploadUrl);
        console.log("key ******** ", key);

        // let user = await UserModel.findOne({_id:targetUserId, isEmailVerified:true});

        // if(!user){
        //     return res.status(404).json({
        //         message : "target User does not exist",
        //         status : false
        //     });
        // }

        // let chat = await ConversationModel.findOne({
        //     participants : {
        //         $all : [loggedInUser, targetUserId]
        //     },
        // });

        // if(!chat){
        //     await ConversationModel.create({
        //         participants : [loggedInUser, targetUserId],
        //     });
        // }else {
        //     chat.participants.push({
        //         senderId : loggedInUser, 
        //         receiverId : targetUserId , 
        //     });
            
        //     await chat.save()
        // }

        res.status(201).json({
            message : "Message sent",
            success : true
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
}

export {sendNewMessage}