
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
    {
        chatId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "conversations",
            required: true,
            index: true,
        },
        senderId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        receiverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        type: {
            type: String,
            enum: ["text", "media", "document"],
            required: true,
        },
        // Used for normal text messages
        text: {
            type: String,
            trim: true,
            // minlength :1
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
    {timestamps: true}
);

MessageSchema.index({ chatId: 1, createdAt: -1 });

let MessageModel = mongoose.model("messages", MessageSchema);

export default MessageModel;