function getIpFunc(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress;
        ip = ip.split(',')[0];
        ip = ip.replace(/^.*:/, '')
    return ip;
};

exports.getIp = getIpFunc;