module.exports = function (req, res, next, db, crypto, log) {
    if (!req.session.roles[0]){
        var responseData = {
            'code': 403
        };
        res.json(responseData);
        return;
    }
    if (req.body['pid'] == undefined || req.body['password'] == undefined){
        var responseData = {
            'code': 400
        };
        res.json(responseData);
        return;
    }
    var id = req.body['pid'];
    var pass = crypto.hash(req.body['password']);
    var params = [id,pass];
    db.query('UPDATE likeafamily.person SET password = $2 WHERE id_num = $1 RETURNING id_num as "id";', params, function (rows) {
        var responseData = {
            'code': 200
        };
        res.json(responseData);
    },function(err){
        var responseData = {
            'code': 402
        };
        res.json(responseData);
    });
}