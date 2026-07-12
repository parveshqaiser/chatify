
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    senderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    msg : {
        type : String,
    }    
},{timestamps:true});


const MessageModel = mongoose.connect("message", MessageSchema);
export default MessageModel;