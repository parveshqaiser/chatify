
import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema({
    participants : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    }],
},{timestamps: true});

let ConversationModel = mongoose.model("conversation", ConversationSchema);
export default ConversationModel;