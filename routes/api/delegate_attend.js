module.exports = function(req, res, next, db, log, cRes, jwt) {
    if (req.body['pid'] == undefined) {
        cRes.sendParamErrorJSON(res);
        return;
    }
    var queryString = 'INSERT INTO likeafamily.attendace_delegation(from_person_id_num,to_person_id_num,is_attendance) VALUES($1,$2,FALSE)';
    var params = [jwt.returnLfId(req) , req.body['pid']];
    db.query(queryString, params, function(rows) {
        cRes.sendOKJSON(res);
        return;
    }, function(err) {
        cRes.sendDBErrorJSON(res);
        return;
    });
}