
import UserModel from "../models/user.model.js";

const userRegistration = async(req, res)=>{

    try {
        let {name, username, password, email} = req.body;

        //  validation

        let createUser = await UserModel.create({
            name,
            username,
            password,
            email
        });


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