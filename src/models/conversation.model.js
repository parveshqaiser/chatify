import mongoose from "mongoose";

const ParticipantsSchema = new mongoose.Schema({
    participants : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    }],
    msg : [{
        type : mongoose.Schema.Types.ObjectId,
        ref : "message"
    }]
},{timestamps: true});

const ParticipantsModel = mongoose.connect("participants", ParticipantsSchema);
export default ParticipantsModel;