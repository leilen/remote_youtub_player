const schedule = require('node-schedule');
const customIp = require("./custom_ip");
const customMailer = require("./custom_mailer.js");
const fs = require("fs");


module.exports.initCron = function () {
    checkIpChanged();
    schedule.scheduleJob('* * * * *', function(){
        checkIpChanged();
    });
}

function checkIpChanged(){
    const currentIp = customIp.getCurrentIp();
    if (!fs.existsSync('config/ip.dat')) {
        fs.writeFileSync("config/ip.dat", currentIp);
    }else{
        fs.readFile('config/ip.dat','utf8', function(err, data) {
            if (data != currentIp){
                fs.writeFile('config/ip.dat', currentIp, 'utf8', function(err) {
                    customMailer.detectedChangedIpFunction(currentIp);
                });
            }
        });
    }
}