
import nodemailer from "nodemailer";

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
