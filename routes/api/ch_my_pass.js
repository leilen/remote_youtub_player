module.exports = function (req, res, next, db, crypto, log, cRes, jwt) {
    if (req.body['current'] == undefined || req.body['new'] == undefined || req.body['confirm-new'] == undefined || req.body['current'] == '' || req.body['new'] == '' || req.body['confirm-new'] == ''){
        cRes.sendParamErrorJSON(res);
        return;
    }
    if (req.body['new'] != req.body['confirm-new']){
        cRes.sendErrorJSON(res,601);
        return;
    }
    var id = jwt.returnLfId(req);
    var current = req.body['current'];
    var pass = crypto.hash(req.body['new']);
    db.query('SELECT password FROM likeafamily.person WHERE id_num = $1', [id], function (rows) {
        if (rows.length == 0){
            cRes.send404JSON(res);
        }else {
            if (crypto.validate(rows[0]['password'], current)){
                var params = [id,pass];
                db.query('UPDATE likeafamily.person SET password = $2 WHERE id_num = $1 RETURNING id_num as "id";', params, function (rows) {
                    log.log(req,'chage-raon-password',[]);
                    res = jwt.logout(res);
                    cRes.sendOKJSON(res,{});
                });
            }else{
                cRes.sendErrorJSON(res,403);
            }
        }
    });

}
