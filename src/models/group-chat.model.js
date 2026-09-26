
import mongoose from "mongoose";

let GroupSchema = new mongoose.Schema({
    avatar: {
        url: {
            type: String,
            // default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQydQ6gzBdZIRUyMTv8oE6iabH4UaeS688WThdGUAnhhw&s=10",
            default: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyMhkU6ImpYVLj4XSVXbVg3z-A3a1hmdeZ4IF3ja-gwQ&s=10"
        },
        publicId: {
            type: String,
            default: null,
        },
        createdAt: {
            type: Date,
            default: null,
        },
    },
    groupName: {
        type: String,
        required: true,
        trim: true,
        minlength: 1,
        maxlength: 50,
        index: true,
    },
    description: {
        type: String,
        trim: true,
        maxlength: 100,
        default: null,
    },
    members: [{
        userId : {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        username : {
            type: String,
            required : true
        }
    }],
    admins: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "users",
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
},{timestamps: true});


const GroupModel = mongoose.model("groups", GroupSchema);

export default GroupModel;