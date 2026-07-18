
import UserModel from "../models/user.model.js";
import { sendEmailToUser } from "../services/nodemailer.service.js";
import { checkInputValidation } from "../utils/validation.js";
import jwt from "jsonwebtoken";
import { generateEmailVerificationToken } from "../utils/generateToken.js"; 
import crypto from "node:crypto";
import path from "node:path";
import LoginAttemptModel from "../models/login.model.js";

const userRegistration = async(req, res)=>{

    try {
        let {name, username, password, email} = req.body;

        // check for email std format, username min chars, password min chars using express-validator

        let errMessage = checkInputValidation(name, username, password, email); // better to send like this because if you send the whole req.body it treats as arry of obj

        if(errMessage){
            return res.status(400).json({
                message : errMessage,
                success : false
            })
        }

        let user = await UserModel.findOne({$or : [{username,email}]});

        // checking if user exist already verified
        if(user && user.isEmailVerified){
            return res.status(409).json({
                message : `User with the email ${user.email} or username ${user.username} already exist. Please Login!`,
                success : false
            })
        }

        let {unhashedToken, hashedToken, tokenExpiry} = generateEmailVerificationToken();

        if (user && !user.isEmailVerified){
            await UserModel.updateOne(
                {email : email},
                {$set : {
                    username : username,
                    password: password,
                    emailVerificationToken: hashedToken,
                    emailVerificationExpiry: tokenExpiry
                }}
            )
        }else {
            let createUser = await UserModel.create({
                name,
                username,
                password,
                email,
                emailVerificationToken: hashedToken,
                emailVerificationExpiry: tokenExpiry
            });
        }

        let verificationURL = `${req.protocol}://${req.get("host")}/api/v1/auth/verify-email/${unhashedToken}`;
       
        sendEmailToUser(email,name, verificationURL).catch(err =>{
            console.error("Background email failed: ", err);
        });

        res.status(201).json({
            message : "User Verification Email sent Successfully. Please check your email",
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

const verifyEmailToken = async(req, res)=>{
    try {
        let emailToken = req.params.verificationToken;

        if (!emailToken) {
            return res.status(400).json({
                message: "Verification token is required",
                success: false
            });
        }

        let hashedToken = crypto.createHash("sha256").update(emailToken).digest("hex");
        // let {tokenExpiry} = generateEmailVerificationToken();  not using now

        let user = await UserModel.findOneAndUpdate(
            {
                emailVerificationToken : hashedToken,
                emailVerificationExpiry : {$gt : Date.now()}
            }, 
            {
                $set : {
                    isEmailVerified: true
                },
                $unset : {
                    emailVerificationToken :"",
                    emailVerificationExpiry:"",
                }
            },
            {
                returnDocument: "after"
            }
        );

        if(!user){
            // return res.status(400).json({
            //     message : "Invalid or Expired Token",
            //     success : false
            // });
            return res.sendFile(
                path.join(process.cwd(),"public","email-invalid.html")
            )
        }
        

        // return res.redirect(`${req.protocol}://${req.get("host")}/api/v1/users/email-verification-success`);
        res.sendFile(
            path.join(process.cwd(), "public", "email-success.html")
        );

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

        let loginAttempt = await LoginAttemptModel.findOne({email});

        if (loginAttempt && loginAttempt.lockedUntil && loginAttempt.lockedUntil > Date.now()) 
        {
            let remainingMinutes = Math.ceil((loginAttempt.lockedUntil - Date.now()) / 60000);
            return res.status(429).json({
                message: `Too many attempts. Try again after ${remainingMinutes} minutes`,
                success: false
            });
        }

        let user = await UserModel.findOne({email, isEmailVerified: true});

        if(!user){
            return res.status(404).json({
                message : "Invalid User or User not verified",
                success: false
            });
        }

        // checking for password
        let isPasswordCorrect = await user.isPasswordCorrect(password);

        if(!isPasswordCorrect){

            let attempts = await LoginAttemptModel.findOne({email});

            if(!attempts){
                await LoginAttemptModel.create({
                    email,
                    failedAttempts:1,
                    lastAttemptAt : Date.now()
                });
            }else {
                attempts.failedAttempts +=1;
                attempts.lastAttemptAt = Date.now();

                if(attempts.failedAttempts >= 4){
                    attempts.lockedUntil = Date.now() +(15 * 60 *1000) // 15 mins
                    attempts.failedAttempts = 0;
                    attempts.isAccountLocked = true
                }

                await attempts.save();
            }

            return res.status(400).json({
                message : "Invalid Credentials",
                success : false
            })
        }

        if(isPasswordCorrect)
        {
            // await LoginAttemptModel.deleteOne({ email });
           if(loginAttempt !==null){
                loginAttempt.failedAttempts =0;
                loginAttempt.lockedUntil = null;
                loginAttempt.isAccountLocked = false;
                await loginAttempt.save();
           }
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

        let data = {
            id: user._id,
            email : user.email,
            name : user.name
        }

        res.status(200).cookie("token", accessToken,{ 
            // httpOnly: true,
            secure: true,          
            sameSite: 'strict',
            maxAge: 2 * 60 * 60 * 1000
        }).json({
            message : `Login Success. Welcome ${user.name}`,
            success : true,
            token : accessToken,
            data : data
        });

    } catch (error) {
        // console.log("**************** ", error);
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
            { $set: { refreshToken: "" , status : "offline"} },
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
            message : `Logout Success ${user.name}`,
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

const currentUser = async(req, res)=>{
    try {
        let {email} = req.user;

        let user = await UserModel.findOne({email}).select("-password");

        if(!user){
            return res.status(404).json({
                message: "User does not exist",
                success: false,               
            })
        }

        res.status(200).json({
            message : "User Data Fetched",
            dsta : user,
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

const updateProfile = async(req, res)=>{
    try {
        let {email} = req.user;

        let {name, bio} = req.body;

        let update = await UserModel.findOneAndUpdate(
            {email:email},
            {
                $set : {
                    name : name,
                    bio : bio
                }
            },
            {
                returnDocument : "after"
            }
        );

        if(!update){
            res.status(404).json({
                message : "User Not found",
                success: false
            });
        }

        res.status(200).json({
            message : "Profle Updated",
            success: true
        });


    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

const updatePassword = async(req,res)=>{
    try {
        let {password:existingPassword, newPassword,confirmPassword} = req.body;

        let errMessage = checkInputValidation(existingPassword, newPassword, confirmPassword);
        if(errMessage){
            return res.status(400).json({
                message : errMessage,
                success : false
            })
        }

        let {email} = req.user;

        let user = await UserModel.findOne({email});

        let isPasswordCorrect = await user.isPasswordCorrect(existingPassword);

        if(!isPasswordCorrect){
            return res.status(400).json({
                message : "Current Passowrd is Invalid",
                success : false
            });
        }

        if(newPassword !== confirmPassword){
            return res.status(400).json({
                message : "New password and confirm password do not match.",
                success :false
            })
        }   

        user.password = newPassword;
        await user.save();

        res.status(200).json({
            message : "Password Changed Successfully",
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

export {
    userRegistration, 
    verifyEmailToken, 
    userLogin, 
    userLogout ,
    currentUser, 
    updateProfile, 
    updatePassword
};