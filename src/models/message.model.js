
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
    senderId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    receiverId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users",
        required : true
    },
    msg : {
        type : String,
    }    
},{timestamps:true});


const MessageModel = mongoose.connect("message", MessageSchema);
export default MessageModel;