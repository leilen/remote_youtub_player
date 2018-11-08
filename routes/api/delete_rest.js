module.exports = function(req, res, next, db, log,cRes,jwt) {
    if (req.body['rid'] == undefined) {
        var responseData = {
            'code': 400
        };
        res.json(responseData);
        return;
    }
    var queryString = 'SELECT likeafamily.delete_rest_log($1::BIGINT,$2::INT)';
    var params = [req.body['rid'], jwt.returnLfId(req)];
    db.query(queryString, params, function(rows) {
        var responseData = {
            'code': rows[0]['delete_rest_log']
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