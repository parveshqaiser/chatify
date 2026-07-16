
import ChatModel from "../models/chat.model.js";
import UserModel from "../models/user.model.js";


const sendMessage = async(req, res)=>{

    try {
        let loggedInUser = req.user.id; // sender id

        let targetUserId = req.params.id;
        let {msg} = req.body;

        if (!msg || msg.trim().length === 0) {
            return res.status(400).json({
                message: "Message cannot be empty",
                success: false,
            });
        }

        let user = await UserModel.findById(targetUserId); // only verified user must come

        if(!user){
            return res.status(404).json({
                message : "Receiver User does not exist",
                success : false
            })
        }

        
       let chat = await ChatModel.findOne({
            participants : {
                $in : [loggedInUser, targetUserId]
            },
        }).populate({path: "message.senderId", select : "name"})


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

export {sendMessage};