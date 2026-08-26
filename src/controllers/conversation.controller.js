import mongoose from "mongoose";

export let sendMessage = async(req, res)=>{
    try {
        let loggedInUser = req.user.id; // sender id
        let {targetUserId} = req.params;

        let {msg} = req.body;

        if (!msg || msg.trim().length === 0) {
            return res.status(400).json({
                message: "Message cannot be empty",
                success: false,
            });
        }


    } catch (error) {
        res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Server Error",
        });
    }
}