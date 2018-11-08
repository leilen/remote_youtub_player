/**
 * Created by sanghwan on 2017. 3. 6..
 */
var db = require('./db_query');
var jwt = require('./custom_jwt.js');
var customIP = require('./custom_ip.js');

exports.ensureAuthenticated = function (req, res, next) {
    jwt.lfDecode(req.cookies['lf-token'], function (decoded) {
        const lfId = decoded['lf-id'];
        const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;

        if (lfId != undefined) {
            const queryString = `
            SELECT
            (
                SELECT
                    COALESCE(ARRAY_AGG(lfrl.lf_role_id_num),'{}'::INT[])
                FROM likeafamily.lf_role_log lfrl
                JOIN likeafamily.lf_role lfr
                ON lfr.id_num = lfrl.lf_role_id_num
                JOIN likeafamily.person p
                ON p.id_num = lfrl.person_id_num
                WHERE p.id_num = $1
                AND lfrl.company_id_num = $2
            ) AS "role",
            (SELECT COUNT(*) FROM likeafamily.lf_role) "role-count"`;
            db.query(queryString, [lfId, selectedCompany], function (data) {
                var roleArr = [];
                for (var i = 0; i < Math.ceil(data[0]['role-count'] / 32); i++) {
                    roleArr[i] = 0;
                }
                for (var i = 0; i < data[0]['role-count']; i++) {
                    var index = Math.floor(i / 32);
                    var level = Math.floor(i % 32);
                    for (var role of data[0]['role']) {
                        if (role == i) {
                            roleArr[index] += 1 << level;
                            break;
                        }
                    }
                }
                jwt.setLfToken(req,res,{
                    'lf-id' : decoded['lf-id'],
                    'role' : roleArr
                });
                res.cookie('selected-company', selectedCompany, {
                    path: '/',
                    maxAge: 3600000
                });

                if (!jwt.checkRole(roleArr,1)) {
                    jwt.logout(res);
                    res.statusCode = 444;
                    res.send('<script>alert(\'권한이 없습니다 관리자에게 문의하세요.\');window.location.replace(\'/\');</script>');
                    return;
                }
                return next();
            });
        }else{
            jwt.logout(res);
            resNeedLogin(res);
        }

    },function(err){
        resNeedLogin(res);
    });
};

function resNeedLogin(res){
    res.statusCode = 444;
    res.send('<script>alert(\'로그인이 필요합니다.\');window.location.replace(\'/\');</script>');
}