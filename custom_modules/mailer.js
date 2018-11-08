/**
 * Created by User on 2016-07-19.
 */
var nodemailer = require('nodemailer');
var config = require('../config/config.json');

var transporter = nodemailer.createTransport({
    host: config.mailer_host,
    port: config.mailer_port,
    secure: true, // use SSL
    auth: {
        user: config.mailer_user,
        pass: config.mailer_password
    }
});


function serverStart() {
    var d = new Date();
    var title = '[Like a Family] start ' + d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate() + " " + d.getHours() + "시" + d.getMinutes() + "분" + d.getSeconds() + "초 ";
    var mailOptions = {
        from: config.mailer_user, // sender address
        to: config.manager_mail, // list of receivers
        subject: title, // Subject line
        text: "", // plaintext body
        html: "<div>" + title + "</div>"
    };
    if (config.mode != "dev"){
        transporter.sendMail(mailOptions, function(error) {
            if (error) {
            }
        });
    }

}


module.exports.serverStart = serverStart;

module.exports.sendMAil = function(to, title, text, callback) {
    var d = new Date();
    var returnTitle = '[Like a Family] ' + title;
    var mailOptions = {
        from: config.mailer_user, // sender address
        to: to, // list of receivers
        subject: returnTitle, // Subject line
        text: text, // plaintext body
        html: "<div>" + text + "</div>"
    };
    if (config.admin_mail != '') {
        if (config.mode != "dev"){
            transporter.sendMail(mailOptions, function(error) {
                if (error) {
                    console.log(error);
                } else {
                    callback();
                }
            });
        }
    }else{
        callback();
    }
}