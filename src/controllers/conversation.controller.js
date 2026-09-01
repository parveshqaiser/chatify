

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

        const { uploadUrl, key , publicUrl} = await generateUploadUrl(fileName,fileType);

        let data = {uploadUrl,key,publicUrl};

        res.status(200).json({
            success : true,
            data : data,          
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Could not generate upload URL",
        });
    }
};

let sendNewMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId} = req.params;

       const { msg, type, file, isEdit, messageId } = req.body;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }
       
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
        
        let loggedInUser = req.user.id; // sender id
        let {targetUserId} = req.params;

        let targetUserExist = await UserModel.findOne({_id: targetUserId,isEmailVerified:true});

        if(!targetUserExist){
            return res.status(404).json({
                message : "Invalid User Id",
                success : false
            });
        }

        const conversation = await ConversationModel.findOne({
            participants: {
                $all: [loggedInUser, targetUserId]
            }
        });

        if (!conversation) {
            return res.status(200).json({
                message : "No Conversation Started",
                success : true
            })
        }

        let message = await MessageModel.find({
            chatId: conversation._id
        }).populate("senderId", "name")
        .populate("receiverId", "name");

        res.status(200).json({
            message : "All Messages Fetched",
            success : true,
            data : message
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
}

let deleteMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId, messageId} = req.params;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let targetUserExist = await UserModel.findOne({
            _id: targetUserId,
            isEmailVerified:true
        });

        if(!targetUserExist){
            return res.status(404).json({
                message : "Invalid User Id",
                success : false
            });
        }

        let deletedMessage = await MessageModel.findOneAndDelete({
            _id :messageId, 
            senderId:loggedInUser,
            receiverId: targetUserId
        });

       if (!deletedMessage) {
            return res.status(404).json({                
                message: "Message not found or you are not allowed to delete this message",
                success: false,
            });
        }

        res.status(200).json({
            success: true,
            message: `Message ${messageId} deleted successfully`,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
} 

let clearAllConversation = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId} = req.params;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let targetUserExist = await UserModel.findOne({
            _id: targetUserId,
            isEmailVerified:true
        });

        if(!targetUserExist){
            return res.status(404).json({
                message : "Invalid User Id",
                success : false
            });
        }

        // first delete from conversation
        let conversation = await ConversationModel.findOneAndDelete({
            participants : {
                $all : [loggedInUser, targetUserId],
                $size :2
            }
        });

         if (!conversation) {
            return res.status(404).json({
                message: "Conversation not found",
                success: false
            });
        }

        // then delete all messages of that conversation
        let delAlMessages = await MessageModel.deleteMany({
            chatId: conversation._id
        });

        // console.log("delAlMessages ", delAlMessages);

        res.status(200).json({
            message : "Conversation Deleted Successfully",
            success: true,
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
}

let editMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId,messageId} = req.params;

        let {msg} = req.body;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let targetUserExist = await UserModel.findOne({
            _id: targetUserId,
            isEmailVerified:true
        });

        if(!targetUserExist){
            return res.status(404).json({
                message : "Invalid User Id",
                success : false
            });
        }


        let message = await MessageModel.findOne({
            _id: messageId, 
            // senderId: loggedInUser
        });

        if(!message){
            return res.status(404).json({
                message : "Message does not exist",
                success : false
            });
        }

        if(message.senderId.toString() !== loggedInUser){
            return res.status(403).json({
                message : "You can only Edit your own messages",
                success : false
            });
        }

        message.text = msg;

        await message.save();

        res.status(200).json({
            message : "Message Edited",
            success : true
        });

    } catch (error) {
        res.status(500).json({
            message: error.message || "Server Error",
            success: false,           
        });
    }
}

export {
    getUploadUrl ,
    sendNewMessage , 
    getAllMessage ,
    deleteMessage,
    clearAllConversation, 
    editMessage
};