
import UserModel from "../models/user.model.js";
import { sendEmailToUser } from "../services/nodemailer.service.js";
import { checkInputValidation } from "../utils/validation.js";

const userRegistration = async(req, res)=>{

    try {
        let {name, username, password, email} = req.body;

        // here comes data validation

        let errMessage = checkInputValidation(name, username, password, email);

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


export {userRegistration};