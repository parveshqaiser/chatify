import mongoose from "mongoose";

const LoginSchema = new mongoose.Schema({
    email : {
        type : String,
        required : true,
        trim : true,
        lowercase : true
    },
    isAccountLocked : {
        type : Boolean,
        default : false
    },
    failedAttempts: {
        type: Number,
        default: 0
    },    
    lockedUntil: {
        type: Date,
        default: null
    },
    lastAttemptAt: {
        type: Date,
        default: null
    }
},{timestamps:true});


const LoginAttemptModel = mongoose.model("logins", LoginSchema);
export default LoginAttemptModel;
