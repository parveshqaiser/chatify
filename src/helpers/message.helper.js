
import ConversationModel from "../models/conversation.model.js";
import MessageModel from "../models/message.model.js";
import UserModel from "../models/user.model.js";

export const handleAddorEditMessage = async ({
    senderId,receiverId,text,type,file
}) => {
    
    if (!senderId || !receiverId) {
        throw new Error("Sender and Receiver IDs are required");
    }

    if (senderId.toString() === receiverId.toString()) {
        throw new Error("Logged in user & Target user cannot be the same");
    }

    if ((!text || text.trim().length === 0) && !file) {
        throw new Error("Message text or file cannot be empty");
    }

    let user = await UserModel.findOne({
        _id: receiverId,
        isEmailVerified: true,
    });

    if (!user) {
        throw new Error("Target user does not exist or is not verified");
    }

    
    let chat = await ConversationModel.findOne({
        participants: {
            $all: [senderId, receiverId]
        }
    });

    if (!chat) {
        chat = await ConversationModel.create({
            participants: [senderId, receiverId]
        });
    }

    let messageData = {
        chatId: chat._id,
        senderId,
        receiverId,
        type,
        text: text?.trim() || null,
        file: file ? {
            url: file.url,
            key: file.key,
            fileName: file.fileName,
            mimeType: file.mimeType,
            size: file.size,
        }
        : null,
    };
     
    let newMessage = await MessageModel.create(messageData);  

    return {
        message: newMessage, 
        chatId: chat._id 
    };
};