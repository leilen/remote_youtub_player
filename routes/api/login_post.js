var config = require('../../config/config.json');
var mailer = require('../../custom_modules/mailer.js');
var customIP = require('../../custom_modules/custom_ip.js');
var moment = require('moment');

module.exports = function (req, res, next, db, crypto, log, cRes, jwt) {
    if (req.body.id == undefined || req.body.pass == undefined) {
        cRes.sendParamErrorJSON(res);
        return;
    }
    db.query(`
    SELECT
         p.nick_name AS "nick-name",
         p.id_num,
         p.password,
        (
            SELECT
                JSON_AGG(sub)
            FROM (
                SELECT
                    sub_c.id_num,
                    sub_c.name
                FROM likeafamily.person_company AS sub_pc
                JOIN likeafamily.company AS sub_c
                ON sub_c.id_num = sub_pc.company_id_num
                JOIN likeafamily.person AS sub_p
                ON sub_p.id_num = sub_pc.person_id_num
                WHERE sub_p.id = $1
                ORDER BY sub_pc.is_main DESC
            ) AS sub
        ) AS "company-arr"
     FROM likeafamily.person AS p
     WHERE id = $1
    `, [req.body.id], function (rows) {
            if (rows.length == 0) {
                cRes.send404JSON(res);
            } else {
                log.log(req, 'login', [req.body.id]);
                if (crypto.validate(rows[0]['password'], req.body.pass)) {
                    // lfId = rows[0]['id_num'];
                    const lfId = rows[0]['id_num'];
                    res.cookie('lf-token', jwt.lfSign({
                        'lf-id': lfId
                    }, false), {
                            path: '/'
                        });
                    if (rows[0]['company-arr'].length > 0) {

                        res.cookie('selected-company', rows[0]['company-arr'][0]["id_num"], {
                            path: '/',
                            maxAge: 3600000
                        });
                    }


                    queryString = 'SELECT COUNT(id_num) > 0 AS "return_bool" FROM likeafamily.attendance_log WHERE person_id_num = $1 AND date_time::DATE = CURRENT_DATE AND is_attendance';
                    var params = [lfId];
                    db.query(queryString, params, function (rows2) {
                        if (!rows2[0]['return_bool']) {
                            const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
                            queryString = 'SELECT likeafamily.attendance($1::BIGINT,$2::BIGINT,$3::BIGINT,$4::BOOLEAN,$5::TEXT)';
                            params = [lfId, lfId, selectedCompany, true, customIP.getIp(req)];
                            db.query(queryString, params, function (rows3) {
                                if (rows3[0]['attendance']['code'] == 200) {
                                    var titleText = rows3[0]['attendance']['data']['nick_name'] + '님이 ' + moment().format('HH:mm') + '에 ' + '출근했습니다.';
                                    mailer.sendMAil(
                                        config.admin_mail,
                                        titleText,
                                        titleText,
                                        function () { }
                                    );
                                }
                                cRes.sendOKJSON(res, {
                                    "nick-name": rows[0]['nick-name'],
                                    "company-arr": rows[0]['company-arr']
                                });
                                return;
                            });
                        } else {
                            cRes.sendOKJSON(res, {
                                "nick-name": rows[0]['nick-name'],
                                "company-arr": rows[0]['company-arr']
                            });
                            return;
                        }
                    });
                } else {
                    cRes.sendErrorJSON(res, 403);
                }
            }
        });
}
