
import nodemailer from "nodemailer";
import { emailTemplate } from "../utils/mailgen.js";

export let transport = nodemailer.createTransport({
    // host: "sandbox.smtp.mailtrap.io",
    host: "smtp.gmail.com",
    service :"gmail",
    // port: 2525,
    port : 587,
    secure: false,
    auth: {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    },
    tls : {
        rejectUnauthorized: false
    }
});

export let sendEmailToUser = async(email,name, verificationURL)=>{

    let {text, html} = emailTemplate(name, verificationURL);

    return await transport.sendMail({
        // from: 'chatify@gmail.com',
        from: process.env.EMAIL_USER,
        to: email,
        // subject: "Welcome to Chatify - Verify Your Account",
        subject : "Confirmation Instructions for Chatify Account",
        text,
        html
    });
}

