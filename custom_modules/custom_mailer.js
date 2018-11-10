const nodemailer = require('nodemailer');
const config = require('../config/config.json');


function detectedChangedIpFunction(ip) {
    const mailerInfo = config.mailer_info;
    if (mailerInfo){
        const transporter = nodemailer.createTransport({
            host: mailerInfo.host,
            port: mailerInfo.port,
            secure: true, // use SSL
            auth: {
                user: mailerInfo.user,
                pass: mailerInfo.password
            }
        });
        const title = `[like_a_juke_box] Ip changed to ${ip}`;
        const mailOptions = {
            from: mailerInfo.user, // sender address
            to: mailerInfo.manager_mail, // list of receivers
            subject: title, // Subject line
            text: "", // plaintext body
            html:"<div>"+title+"</div>"
        };
        transporter.sendMail(mailOptions, function(error){
            if(error){
                console.log(`mailer error : ${error}`)
            }
        });
    }
}

module.exports.detectedChangedIpFunction = detectedChangedIpFunction;