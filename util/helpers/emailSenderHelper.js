const sgMail = require('@sendgrid/mail');

module.exports = (to, subject, html) => {
    return new Promise((resolve, reject) => {
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg = {
            to: to,
            from: 'no-reply@chatterapp.com',
            subject: subject,
            html: html,
        };
        sgMail.send(msg)
            .then(res => {
                resolve(res)
            })
            .catch(err => {
                reject(err)
            })
    })
    
}