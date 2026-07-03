import mongoose from "mongoose";

let UserSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    username : {
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        trim : true,
        index : true,
        unique : true,
    },
    password : {
        type : String,
        required : true
    },
    // this is best practise
    status : {
        type : String,
        default : "offline",
        enum : {
            values : ["offline","online","away"],
            message: `{VALUE} is not a valid status`
        }
    },
    bio : {
        type : String,
        default : "Hey there !"
    },   
    lastseen : {
        type : Date
    },
    avatar : {
        type : String,
        default : "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRT0M9PkaDKnCMW8NANGmmvjkS-WhhsIOe4pQ&s",
    },
    isUserVerified: {
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
},{timestamps:true});

let UserModel = new mongoose.model("users");
export default UserModel;

