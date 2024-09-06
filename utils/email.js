const nodemailer =require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

module.exports = class Email {
    constructor(user , url) {
        this.to = user;
        this.firstname = user.name.split(' ')[0];
        this.from = `MUjib Ahasan <${process.env.EMAIL_FROM}>`,
        this.url = url
    }

    createTransport() {
        if(process.env.NODE_ENV === 'production'){
            return 1;
        }

        return nodemailer.createTransport({
            host:process.env.EMAIL_HOST, 
            port:process.env.EMAIL_PORT,
            auth:{
                user:process.env.EMAIL_USERNAME,
                pass:process.env.EMAIL_PASSWORD
            }
        })
    }


   async send (template , subject){
        const html = pug.renderFile(`${__dirname}/../views/${template}.pug`,{
            firstname : this.firstname,
            url : this.url,
            subject
        })
     
        const mailOptions = {
            from:this.from,
            to:this.to,
            subject,
            html,
            // text:htmlToText.fromString(html)
             }

             await this.createTransport.sendMail(mailOptions);
    }

   async sendWelcome (){
       await this.send('welcome' ,'welcome to the natours apP') 
    }

    async forgetPassword (){
  await this.send('forgetPassword','fix your password here!')
    }
}
