
import ChatModel from "../models/chat.model.js";
import UserModel from "../models/user.model.js";


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

        let user = await UserModel.findOne({_id:targetUserId, isEmailVerified:true}); // only verified user must come

        if(!user){
            return res.status(404).json({
                message : "Target User does not exist",
                success : false
            })
        }

        let chat = await ChatModel.findOne({
            participants : {
                $all : [loggedInUser, targetUserId]
            },
        }).populate({path: "message.senderId", select : "name"});

        let createChat;  // creating new chat

        if(!chat)
        {
            chat = await ChatModel.create({
                participants : [loggedInUser, targetUserId],
                message : [{senderId : loggedInUser, receiverId : targetUserId , msg : msg}]
            })
        }else {
            chat.message.push({
                senderId : loggedInUser, 
                receiverId : targetUserId , 
                msg : msg.trim()
            });

            await chat.save();
        }

        res.status(200).json({
            message : "Message Sent Successfully",
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

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

// individual message
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
            message : "Chat Deleted",
            success : true.valueOf,
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
                message: "Conversation not found.",
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


export {
    sendMessage, 
    getAllMessage,
    deleteMessage,
    clearConversation
};