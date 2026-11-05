
import mongoose from "mongoose";

// this is v2 of individual chats
const ConversationSchema = new mongoose.Schema({
    participants : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    }],
},{timestamps: true});

let ConversationModel = mongoose.model("conversation", ConversationSchema);
export default ConversationModel;