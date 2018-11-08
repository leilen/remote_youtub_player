module.exports = function(req, res, next, db, crypto, log, cRes, jwt) {
    if (!jwt.checkRoleWithReq(req,0)){
        cRes.sendForbiddenJSON(res);
        return;
    }
    if (req.body['name'] == undefined || req.body['id'] == undefined || req.body['nick-name'] == undefined || req.body['password'] == undefined || req.body['join-date'] == undefined || req.body['sex'] == undefined){
        cRes.sendParamErrorJSON(res);
        return;
    }
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
    var queryString = 'SELECT likeafamily.add_person($1::TEXT,$2::BIGINT,$3::TEXT,$4::TEXT,$5::TEXT,TO_DATE($6,\'YY.MM.DD\'),$7,$8::INT[],$9::INT[])';

    var params = [];
    params.push(req.body['id']);
    params.push(selectedCompany);
    params.push(req.body['name']);
    params.push(req.body['nick-name']);
    params.push(crypto.hash(req.body['password']));
    params.push(req.body['join-date']);
    params.push(req.body['sex']);
    req.body['department'].split(',').length
    params.push(isNotEmptyArray(req.body['department']) ? (`{${req.body['department']}}`) : null);
    params.push(isNotEmptyArray(req.body['priv']) ? (`{${req.body['priv']}}`) : null); 

    db.query(queryString, params, function(rows) {
        if (rows[0]['add_person']['code'] == 200 || rows[0]['add_person']['code'] == 201){
            cRes.sendOKJSON(res,{"is-already-exist" : rows[0]['add_person']['code'] == 201});
        }else if (rows[0]['add_person']['code'] == 401){
            cRes.sendErrorJSON(res,401)
        }
    }, function(err) {
        cRes.sendDBErrorJSON(res);
    });
};

function isNotEmptyArray(string){
    if (string == undefined || string == null){
        return false
    }
    const splited = string.split(',');
    if (splited.length == 0){
        return false;
    }
    if (splited[0].trim() == ''){
        return false;
    }
    for (const v of splited){
        if (isNaN(v)){
            return false;
        }
    }
    return true;
}