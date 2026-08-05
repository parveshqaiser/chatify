
import UserModel from "../models/user.model.js";
import { sendEmailToUser } from "../services/nodemailer.service.js";
import { checkInputValidation } from "../utils/validation.js";
import jwt from "jsonwebtoken";
import { generateEmailVerificationToken } from "../utils/generateToken.js"; 
import crypto from "node:crypto";
import path from "node:path";
import LoginAttemptModel from "../models/login.model.js";
import { allowedDomains, generateDate } from "../utils/constants.js";

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

        if (password.length <=5){
            return res.status(400).json({
                message : "Password should be min 6 chars",
                success : false
            })
        }

        if(!allowedDomains.some(domain => email.endsWith(domain))){
            return res.status(400).json({
                message : "Please enter a valid Gmail, Hotmail, or Yahoo email address",
                success : false
            });
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

        try {
            let emailResult = await sendEmailToUser(email,name, verificationURL);
            console.log("----- waiting for message id ", emailResult.messageId);
        } catch (emailError) {
            console.log("some error in email ", emailError);
        }
       

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
        // http://192.168.1.10:7500/api/v1/users/verify-email/abc123

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

        if(!user)
        {
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
        let refreshToken = jwt.sign(payload,process.env.JWT_REFRESH_SECRET_KEY, {expiresIn:"2d"});

        user.refreshToken = refreshToken;
        user.status = "online";
        user.previousLogin = user.lastLogin;
        user.lastLogin = generateDate()

        await user.save();

        let data = {
            id: user._id,
            email : user.email,
            name : user.name
        }

    //    console.log(res.getHeaders());
    
        res.cookie("token", accessToken,{
            sameSite : "strict",
            secure: false,
            httpOnly: true, 
            maxAge: 2 * 60 * 60 * 1000,
        }).status(200).json({
            // message : `Login Success. Welcome ${user.name}`,
            message : `Login Success`,
            success : true,
            token : accessToken,
            data : data
        });

    } catch (error) {
        // console.log("**************** ", error);
        return res.status(500).json({ 
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
            secure: false,
            httpOnly: true,
        }).json({
            message : `Logout Success ${user.name}`,
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
            data : user,
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
        // from front end i need to pass using passowrd key

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
        user.lastPasswordUpdated = generateDate();

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

const fetchAllUsers = async(req, res)=>{
    try {
        let {email} = req.user; // loggedin user

        let users = await UserModel.find({
            email : {$ne : email}, 
            isEmailVerified : true
        }).select("-password -refreshToken");

        res.status(200).json({
            message : "Date Fetched",
            success : true,
            data : users
        });

    } catch (error) {
        res.status(500).json({ 
            message: "Server Error", 
            error: error.message, 
            success: false 
        });
    }
}

const generateAccessToken = async(req, res)=>{
    try {
        let incomingRefreshToken  = req.cookies?.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({
                message: "No Refresh Token provided",
                success: false
            });
        }

        let verifyToken = jwt.verify(incomingRefreshToken, process.env.JWT_REFRESH_SECRET_KEY);

        let user = await UserModel.findOne({
            _id: verifyToken.id
        }).select("-password");

        if(!user){
            return res.status(404).json({
                message : "User Does not Exists", 
                succcess : false
            });
        }

        if(incomingRefreshToken != user.refreshToken){
            return res.status(401).json({
                message : "Refresh Token is used or expired", 
                success : false
            });
        }

        let payload = {
            id : user._id,
            email : user.email
        };

        let newAccessToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn : "2h"});
        // let newRefreshToken = jwt.sign(payload,process.env.JWT_REFRESH_SECRET_KEY, {expiresIn:"7d"});

        // user.refreshToken = newRefreshToken;
        // await user.save();

        res.cookie("token", newAccessToken,{
            sameSite : "strict",
            secure: false,
            httpOnly: true, 
            maxAge: 2 * 60 * 60 * 1000,
        }).status(200).json({
            message : `Access Token Generated Successfully`,
            success : true,
        });

    } catch (error) {

        if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") 
        {
            return res.status(401).json({
                success: false,
                message: "Refresh token expired"
            });

        }
        
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
    updatePassword,
    fetchAllUsers,
    generateAccessToken
};