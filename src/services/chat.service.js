
import ChatModel from "../models/chat.model.js";
import UserModel from "../models/user.model.js";

// using this service when adding new message
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
        // adding to exisint chat to continuw convo
        chat.message.push({
            senderId : loggedInUser, 
            receiverId : targetUserId , 
            msg : msg.trim()
        });

        await chat.save();
    }
    return chat;
}


export let editMessageService = async(loggedInUser,targetUserId, messageId,msg)=> {

    let chat = await ChatModel.findOne({
        participants : {
            $all: [loggedInUser, targetUserId],
            $size: 2
        }
    });
    
    if (!chat) {
        const error = new Error("Conversation not found");
        error.statusCode = 404;
        throw error;
    }
    
    let messageIndex = chat.message.findIndex(msg => msg._id == messageId);
    // console.log("messageIndex ", messageIndex);

    if(messageIndex === -1){
        const error = new Error("Message not found");
        error.statusCode = 404;
        throw error;
    }
    
    let userMessage = chat.message[messageIndex];

    if(userMessage.senderId.toString() !== loggedInUser){
        const error = new Error("You can only Edit your own messages");
        error.statusCode = 403;
        throw error;
    }
    
    userMessage.msg = msg;
    await chat.save();
    return chat;
}