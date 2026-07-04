
import UserModel from "../models/user.model.js";
import { emailContent } from "../utils/mailgen.js";
import { transport } from "../services/nodemailer.service.js";

const userRegistration = async(req, res)=>{

    try {
        let {name, username, password, email} = req.body;

        let createUser = await UserModel.create({
            name,
            username,
            password,
            email
        });


        let {emailHtml, emailText} = emailContent();

        let options = {
            from: "chatify.test@gmail.com",
            to: email,
            subject: "Welcome to Chat App - Verify Your Account",
            text : emailText,
            html : emailHtml
        };

     
        let mail = await transport.sendMail(options);

        res.status(201).json({
            message : "User Registered Successfuly",
            success : true
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}


export {userRegistration};