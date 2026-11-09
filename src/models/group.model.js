
import mongoose from "mongoose";

let GroupSchema = new mongoose.Schema({
    groupAvatar: {
        url: {
            type: String,
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
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        role: {
            type: String,
            enum: ["admin", "member"],
            default: "member",
        },
        joinedAt: {
            type: Date,
            default: Date.now()
        }
    }],
    // last message in the group , the id here is message id of that group
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,  
        ref: "group-messages",
        default: null,
    },
    lastMessageAt: {
        type: Date,
        default: null,
    },
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

/*
        joinedAt: {
            type: Date,
            default: new Date()
        },
        joinedAt: {
            type: Date,
            default: Date.now  // it gives timestamp otherwise both the date & time will be same
        }

*/