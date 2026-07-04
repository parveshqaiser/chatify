
import Mailgen from "mailgen";

export let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Chatify',
        link: 'https://mailgen.js/'
    }
});

export const emailContent = (name)=>{
    let emailBody = {
        body: {
            name: name,
            intro: 'Welcome to Chatify! We\'re very excited to have you on board.',
            action: {
                instructions: 'To Verify your account, please click here:',
                button: {
                    color: '#22BC66',
                    text: 'Verify Your Account',
                    link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
                }
            },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };


    let emailHtml = mailGenerator.generate(emailBody);
    let emailText = mailGenerator.generatePlaintext(emailBody);

    return {emailHtml,emailText}
};
