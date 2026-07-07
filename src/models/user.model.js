import mongoose from "mongoose";
import crypto from "node:crypto"

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
    refreshToken : {
        type: String
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    emailVerificationToken : {
        type : String
    },
    emailVerificationExpiry : {
        type : Date
    },
     forgotPasswordToken : {
        type : String,
    },
    forgotPasswordExpiry : {
        type : Date
    },   
},{timestamps:true});

/*
    UserSchema.pre("save",async function (next){

        if(!this.isModified("password")) return next()  // it will run only when you first create & update password. remaining time it wont run

        this.password = await bcrypt.hash(this.password,10);
        next()
    })

*/


UserSchema.methods.isPasswordCorrect = async function(enteredPassowrd){
    return this.password == enteredPassowrd;
}

// below is called instance of method, if user is empty, this method will return null
// UserSchema.methods.generateTemporaryToken = async function(){

//     let unhashedToken = crypto.randomBytes(10).toString("hex");
//     let hashToken = crypto.createHash("sha256").update(unhashedToken).digest("hex");
//     let tokenExpiry = Date.now() +(5*60*1000);
//     return {unhashedToken,hashedToken, tokenExpiry};
// }

let UserModel = mongoose.model("users", UserSchema);
export default UserModel;

