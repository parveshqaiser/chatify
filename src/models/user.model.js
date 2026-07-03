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
        required : [true, "Password is required"]
    },
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
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isUserVerified: {
        type: Boolean,
        default: false,
    },
    refreshToken : {
        type: String
    },
    forgotPasswordToken : {
        type : String,
    },
    forgotPasswordExpiry : {
        type : Date
    },
    emailVerificationToken : {
        type : String
    },
    emailVerificationExpiry : {
        type : Date
    }
   
},{timestamps:true});

UserSchema.methods.isPasswordCorrect = async function(password){
    return this.password = enteredPassowrd;
}

let UserModel = mongoose.model("users", UserSchema);
export default UserModel;

