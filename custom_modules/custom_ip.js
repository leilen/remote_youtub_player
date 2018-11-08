var config = require('../config/config.json');

function getIpFunc(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
        ip = ip.split(',')[0];
        ip = ip.replace(/^.*:/, '')
    return ip;
};

function checkIsOfficeFunc(req){
    var ipArr = getIpFunc(req).split('.');
    var officeIpArr = config['office_ip'].split('.');

    if (ipArr.length != officeIpArr.length){
        return false;
    }
    for (i=0;i<officeIpArr.length;i++){
        if (officeIpArr[i] != '*' && officeIpArr[i] != ipArr[i]){
            return false;
        }
    }

    return true;
}

exports.getIp = getIpFunc;
exports.checkIsOffice = checkIsOfficeFunc;