
import Mailgen from "mailgen";

export let mailGenerator = new Mailgen({
    theme: 'default',
    product: {
        // Appears in header & footer of e-mails
        name: 'Chatify',
        link: 'https://mailgen.js/'
    }
});

export const emailTemplate = (name, verificationURL)=>{
    let email = {
        body: {
            name: name,
            intro: 'Welcome to Chatify! We\'re very excited to have you on board.',
            action: {
                instructions: 'Verify your email address by clicking the button below',
                button: {
                    color: '#bb269b',
                    text: 'Verify Your Account',
                    // link: 'https://mailgen.js/confirm?s=d9729feb74992cc3482b350163a1a010'
                    link : verificationURL
                }
            },
        outro: [
                'Need help, or have questions? Just reply to this email support@chatify.com , we\'d love to help.',
                'Note: Unverified accounts are automatically deleted after 30 days of signup.',
                'If you did not request this account, please ignore this email.'
            ],
        // signature : false
        }
    };

    return {
        html : mailGenerator.generate(email),
        text : mailGenerator.generatePlaintext(email)
    }
};
