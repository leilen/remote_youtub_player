var config = require('../../config/config.json');
var mailer = require('../../custom_modules/mailer.js');
var customIP = require('../../custom_modules/custom_ip.js');
var moment = require('moment');

module.exports = function(req, res, next, db, log, cRes, jwt) {
    if (req.body['attendance'] == undefined || (req.body['attendance'] != '1' && req.body['attendance'] != '0')) {
        cRes.sendParamErrorJSON(res);
        return;
    }

    const lfId = jwt.returnLfId(req);
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;

    var queryString = 'SELECT likeafamily.attendance($1::BIGINT,$2::BIGINT,$3::BIGINT,$4::BOOLEAN,$5::TEXT)';
    var params = [
        lfId, 
        (req.body['target'] == undefined ? lfId : req.body['target']),
        selectedCompany, (req.body['attendance'] == '0' ? false : true),
        customIP.getIp(req)
    ];
    db.query(queryString, params, function(rows) {
        if (rows[0]['attendance']['code'] == 200) {
            var titleText = rows[0]['attendance']['data']['nick_name'] + '님이 ' + moment().format('HH:mm') + '에 ' + (req.body['attendance'] == 1 ? '출근' : '퇴근') + '했습니다.';
            mailer.sendMAil(
                config.admin_mail,
                titleText,
                titleText,
                function() {}
            );
        }
        cRes.sendOKJSON(res,{},rows[0]['attendance']['code']);
        return;
    });
}