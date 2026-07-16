
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
        trim : true,
        required : true,
        minlength :1
    }    
},{timestamps:true});


// Note: if chat schema had only sender and receiver id, then we are restricting it to two only

const ChatSchema = new mongoose.Schema({
    participants : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    }],
    message : [MessageSchema]
},{timestamps: true});

let ChatModel = mongoose.model("chats", ChatSchema);
export default ChatModel;