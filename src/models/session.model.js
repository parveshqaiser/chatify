import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
    userId : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "users"
    },
    loginAt: {
        type: Date,
        default: Date.now
    },
    logoutAt: {
        type: Date,
        default: null
    },
    isActive : {
        type : Boolean,
        default : false
    },
    failedLoginAttempts: {
        type: Number,
        default: 0
    },

    lockedUntil: {
        type: Date,
        default: null
    }
}, {timestamps: true});


const SessionModel = mongoose.model("sessions", SessionSchema);
export default SessionModel;
