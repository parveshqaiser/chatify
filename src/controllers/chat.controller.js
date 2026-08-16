
import mongoose from "mongoose";
import ChatModel from "../models/chat.model.js";
import UserModel from "../models/user.model.js";
import { editMessageService, saveMessage } from "../services/chat.service.js";


const sendMessage = async(req, res)=>{

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

        let chat = await saveMessage(loggedInUser,targetUserId, msg);
        
        res.status(200).json({
            message : "Message Sent Successfully",
            success : true,
            data : chat
        });

    } catch (err) {
        res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Server Error",
        });
    }
}

/*
const getAllMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id;
        let {targetUserId} = req.params;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let page = parseInt(req.query.page) || 1;
        let limit = Math.min(parseInt(req.query.limit) || 10, 20);
        let skip = (page - 1) * limit;

        let chat = await ChatModel.findOne({
            participants: {
                $all: [
                    new mongoose.Types.ObjectId(loggedInUser),
                    new mongoose.Types.ObjectId(targetUserId)
                ]
            }
        });

        if (!chat) {
            return res.status(200).json({
                message: "No Conversation started",
                success: true,
                data: {
                    messages: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalMessages: 0,
                        hasMore: false
                    }
                }
            });
        }

        let totalMessages = chat.message.length;
        let totalPages = Math.ceil(totalMessages / limit);

        // Get paginated messages (from newest to oldest)
        let messages = chat.message
            .slice(-(skip + limit), totalMessages - skip)
            .slice(0, limit);

        res.status(200).json({
            message: messages.length === 0 ? "No messages found" : "Data fetched",
            success: true,
            data: {
                messages: messages || [],
                pagination: {
                    currentPage: page,
                    totalPages: totalPages,
                    totalMessages: totalMessages,
                    hasMore: page * limit < totalMessages
                }
            }
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

*/

const getAllMessage = async(req, res)=>{

     try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId} = req.params;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let chat = await ChatModel.findOne({
            participants : {
                $all: [loggedInUser, targetUserId]
            }
        }).populate({path: "message.senderId", select : "name"})
        .populate({path: "message.receiverId", select : "name"});

        res.status(200).json({
            message : chat == null ? "No Conversation started": "Data fetched",
            success : true,
            data : chat == null ? [] : chat 
        });
    } catch (error){
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }

}

//  individual message
const deleteMessage = async (req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId, messageId} = req.params;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let chat = await ChatModel.findOne({
            participants : {
                $all: [loggedInUser, targetUserId],
                $size :2
            }
        });

        if (!chat) {
            return res.status(404).json({
                message: "Chat not found",
                success: false,                
            });
        }

        let msgIndex = chat.message.findIndex(msg => msg._id.toString() == messageId);

        if(msgIndex === -1){
            return res.status(404).json({
                message : "Message Not found",
                success : false
            });
        }

        let userMessage = chat.message[msgIndex];

        // if loggedinuser id & sender id of that message is same that only you can delete, means you can't delete other message
        if(userMessage.senderId.toString() !== loggedInUser){
            return res.status(403).json({
                message: "You can only delete your own messages",
                success : false
            });
        }

        chat.message.splice(msgIndex,1);
        await chat.save();

        res.status(200).json({
            message : "Message Deleted",
            success : true,
            data : chat 
        });
        
    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

const clearConversation = async(req, res)=>{
    try {
        
        let loggedInUser = req.user.id;
        let {targetUserId} = req.params;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

        let chat = await ChatModel.findOneAndDelete({
            participants : {
                $all : [loggedInUser, targetUserId],
                $size :2
            }
        })

        if (!chat) {
            return res.status(404).json({
                message: "Start Conversation to Delete",
                success: false,               
            });
        }

        let data = {
            id : chat._id
        };

        // this approach is not good as it still contains the _id of the doc
        // let chat = await ChatModel.findOneAndUpdate(
        //     {
        //         participants: {
        //             $all: [loggedInUser, targetUserId],
        //             $size: 2
        //         }
        //     },
        //     {
        //         $set: {
        //             participants: [],
        //             message: []
        //         }
        //     },
        //     {
        //         // new: true
        //         returnDocument: "after"
        //     }
        // );

        res.status(200).json({
            message : "Conversation Deleted Successfully",
            success : true,
            data : data
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

const editMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id;
        let {targetUserId, messageId} = req.params;
        let {msg} = req.body;

        if(loggedInUser == targetUserId.toString()){
            return res.status(400).json({
                message : "Logged In User & Target User id cannot be same",
                success : false
            })
        }

       let chat = editMessageService(loggedInUser, targetUserId, messageId, msg);

        // chat.message = chat.message.map((val, idx)=>{
        //     if (messageIndex == idx){
        //         return{
        //             ...val,
        //             msg : msg                     
        //         }
        //     }
        //     return val;
        // });

        userMessage.msg = msg;
        await chat.save();

        res.status(200).json({
            message : "Selected Message Updated Successfully",
            success : true
        });

    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
}


export {
    sendMessage, 
    getAllMessage,
    deleteMessage,
    clearConversation,
    editMessage
};