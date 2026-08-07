
import ChatModel from "../models/chat.model.js";
import UserModel from "../models/user.model.js";

export let saveMessage = async(loggedInUser,targetUserId, msg)=>{

    let user = await UserModel.findOne({_id:targetUserId, isEmailVerified:true}); // only verified user must come

    if(!user){
        const error = new Error("Target User does not exist");
        error.statusCode = 404;
        throw error;
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
    return chat;
}