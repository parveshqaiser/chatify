
import nodemailer from "nodemailer";
import { emailTemplate } from "../utils/mailgen.js";

export let transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    // host: "smtp.gmail.com",
    port: 2525,
    secure: false,
    auth: {
        user: "6da6413592de86",
        pass: "1a00889f84a998"
    },
    tls : {
        rejectUnauthorized: false
    }
});

export let sendEmailToUser = async(email,name)=>{

    let {text, html} = emailTemplate(name);

    return transport.sendMail({
        from: '"Chatify" <chatify.test@gmail.com>',
        to: email,
        subject: "Welcome to Chatify - Verify Your Account",
        text,
        html
    });
}

