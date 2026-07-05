
import Mailgen from "mailgen";

export let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Chatify',
        link: 'https://mailgen.js/'
    }
});

export const emailTemplate = (name)=>{
    let email = {
        body: {
            name: name,
            intro: 'Welcome to Chatify! We\'re very excited to have you on board.',
            action: {
                instructions: 'To Verify your account, please click here:',
                button: {
                    color: '#bb269b',
                    text: 'Verify Your Account',
                    link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
                }
            },
        outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
        }
    };

    return {
        html : mailGenerator.generate(email),
        text : mailGenerator.generatePlaintext(email)
    }
};
