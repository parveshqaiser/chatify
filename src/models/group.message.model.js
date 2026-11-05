
import mongoose from "mongoose";

const GroupMessageSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "groups",
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        type: {
            type: String,
            enum: ["text", "media", "document"],
            required: true,
        },
        text: {
            type: String,
            trim: true,
            default: null,
        },
        file: {
            url: {
                type: String,
                default: null,
            },
            key: {
                type: String,
                default: null,
            },
            fileName: {
                type: String,
                default: null,
            },
            mimeType: {
                type: String,
                default: null,
            },
            size: {
                type: Number,
                default: null,
            },
            duration: {
                type: Number,
                default: null,
            },
        },
    },
    { timestamps: true }
);

GroupMessageSchema.index({ groupId: 1, createdAt: -1 });

let GroupMessageModel = mongoose.model("group-messages",GroupMessageSchema);

export default GroupMessageModel;