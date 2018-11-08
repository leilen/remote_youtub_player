module.exports = function(req, res, next, db, log) {
    if (!req.session.roles[0]) {
        var responseData = {
            'code': 403
        };
        res.json(responseData);
        return;
    }
    var data = {};
    if (req.query['pid'] == undefined) {
        var responseData = {
            'code': 400
        };
        res.json(responseData);
        return;
    }
    var queryString = 'SELECT' +
        '\n   lfr.id_num  AS "id-num",' +
        '\n   lfr.name AS "name",' +
        '\n   lfrl.id_num IS NOT NULL AS "is-selected"' +
        '\nFROM likeafamily.lf_role AS lfr' +
        '\nLEFT JOIN likeafamily.lf_role_log AS lfrl' +
        '\nON lfrl.lf_role_id_num = lfr.id_num' +
        '\nAND lfrl.person_id_num = $1' +
        '\nORDER BY lfr.id_num';
    var params = [req.query.pid];
    db.query(queryString, params, function(rows) {
        var responseData = {
            'code': 200,
            'data': rows
        };
        res.json(responseData);
        return;
    }, function(err) {
        var responseData = {
            'code': 402
        };
        res.json(responseData);
        return;
    });
}