
import UserModel from "../models/user.model.js";
import { sendEmailToUser } from "../services/nodemailer.service.js";
import { checkInputValidation } from "../utils/validation.js";
import jwt from "jsonwebtoken";

const userRegistration = async(req, res)=>{

    try {
        let {name, username, password, email} = req.body;

        // here comes data validation

        let errMessage = checkInputValidation(name, username, password, email); // better to send like this because if you send the whole req.body it treats as arry of obj

        if(errMessage){
            return res.status(400).json({
                message : errMessage,
                success : false
            })
        }

        let createUser = await UserModel.create({
            name,
            username,
            password,
            email
        });

        sendEmailToUser(email,name).catch(err =>{
            console.error("Background email failed: ", err);
        })

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

const userLogin = async(req, res)=>{
    try {
        
        let {email, password} = req.body;

        let user = await UserModel.findOne({email});

        if(!user){
            return res.status(404).json({
                message : "User Account Does not exist",
                success: false
            });
        }

        // check for password

        if(password !== user.password){
            return res.status(400).json({
                message : "Password Not Matched",
                success : false
            })
        }

        let payload = {
            id : user._id,
            email : user.email
        };

        let accessToken = jwt.sign(payload,process.env.JWT_SECRET_KEY, {expiresIn:"2h"});
        let refreshToken = jwt.sign(payload,process.env.JWT_SECRET_KEY, {expiresIn:"7d"});

        user.refreshToken = refreshToken;
        user.status = "online";
        await user.save();

        res.status(200).cookie("token", accessToken,{ 
            // httpOnly: true,
            secure: true,          
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000
        }).status(200).json({
            message : "Login Success",
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

const userLogout = async(req, res)=>{
    try {
        let id = req.user.id;

        let user = await UserModel.findByIdAndUpdate(
            id,
            { $set: { refreshToken: "" } },
            {returnDocument: "after"}
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User does not exist"
            });
        }

        res.status(200).clearCookie("token",{
            sameSite: "strict",
            secure: true,
            // httpOnly: true,
        }).json({
            message : "Logout Success",
            success : true
        })

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

export {userRegistration, userLogin, userLogout};