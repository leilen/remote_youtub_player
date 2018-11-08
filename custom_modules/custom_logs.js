var winston = require('winston');

var logger = new (winston.Logger)({
    transports: [
        new (winston.transports.Console)(),
        new (winston.transports.DailyRotateFile)({
        filename: './LF',
        datePattern: 'yyyy-MM-dd.log',
        dirname: __dirname + '/../logs',
        timestamp: function () {
            var logDate = new Date();
            var logDateString = logDate.getFullYear() + '.' + (logDate.getMonth() + 1) + '.' + logDate.getDate() + ' ' + logDate.getHours() + ':' + logDate.getMinutes() + ':' + logDate.getSeconds();
            return logDateString;
        }
    })
    ]
});

module.exports.log = function (req, queryString, param) {
    var ip = req.headers['x-forwarded-for']
        || req.connection.remoteAddress
        || req.socket.remoteAddress
        || req.connection.socket.remoteAddress;
        ip = ip.replace(/^.*:/, '')
    logger.log('info', 'LF Log : ' + queryString, { 'ip': ip, 'param': JSON.stringify(param) });
}

module.exports.logWithoutReq = function (code, queryString, param) {
    logger.log('info', 'LF Log : ' + queryString, {'param': JSON.stringify(param), 'code': code });
}