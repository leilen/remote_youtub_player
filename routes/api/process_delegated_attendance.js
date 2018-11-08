var config = require('../../config/config.json');
var customIP = require('../../custom_modules/custom_ip.js');

module.exports = function(req, res, next, db, log, cRes, jwt) {
    if (req.body['did'] == undefined) {
        cRes.sendParamErrorJSON(res);
        return;
    }

    var queryString = 'SELECT from_person_id_num , to_person_id_num, date_time FROM likeafamily.attendace_delegation WHERE id_num = $1';
    var params = [req.body['did']];
    db.query(queryString, params, function(rows) {
        if (rows.length == 0){
            cRes.send404JSON(res);
            return;
        }
        if (rows[0]['to_person_id_num'] != jwt.returnLfId(req)){
            cRes.sendForbiddenJSON(res);
            return;
        }
        const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
        queryString = 'SELECT likeafamily.attendance($1::BIGINT,$2::BIGINT,$3::BIGINT,$4::BOOLEAN,$5::TEXT)';
        params = [
            jwt.returnLfId(req),
            rows[0]['from_person_id_num'], 
            selectedCompany, 
            (req.body['attendance'] == '1' ? true : false),
            jwt.checkRoleWithReq(req,0) ? null : customIP.getIp(req)];
        db.query(queryString, params, function(rows2) {
            if (rows2[0]['attendance']['code'] == 200){
                cRes.sendOKJSON(res);
                return;
            }else{
                cRes.sendOKJSON(res,{},rows2[0]['attendance']['code']);
                return;
            }
        }, function(err) {
            cRes.sendDBErrorJSON(res);
            return;
        });

    }, function(err) {
        cRes.sendDBErrorJSON(res);
        return;
    });
}