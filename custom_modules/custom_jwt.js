var jwt = require('jsonwebtoken');
var config = require('../config/config.json');
var tokenKey = config.token_secret;



module.exports.sign = function (payload) {
    var token = jwt.sign(payload, tokenKey, {
        algorithm: 'HS256',
        expiresIn: (600)
    });
    return token;
};

module.exports.getToken = function (wenwoId) {
    var token = jwt.sign({
        id: wenwoId,
        os: 3,
        lang: 2
    }, tokenKey, {
        algorithm: 'HS256',
        expiresIn: (600)
    });
    return token;
};

module.exports.lfSign = function (payload, isOffice) {
    var token = jwt.sign(payload, tokenKey, {
        algorithm: 'HS256',
        expiresIn: (isOffice ? "3h" : "1h")
    });
    return token;
};

function lfDecode(token, callback, errorCallback) {
    return jwt.verify(token, tokenKey, function (err, decoded) {
        if (err) {
            errorCallback(err);
        } else {
            callback(decoded);
        }
    });
};

function checkRole(roleArr, role) {
    return roleArr[Math.floor(role / 32)] & (1 << role % 32) ? true : false;
};

module.exports.setLfToken = function (req, res, payload) {
    var token = jwt.sign(payload, tokenKey, {
        algorithm: 'HS256',
        expiresIn: "1h"
    });
    req.cookies['lf-token'] = token;
    res.cookie('lf-token', token, {
        maxAge: 3600000
    });
};
module.exports.refreshLfToken = function (req, res) {
    lfDecode(req.cookies['lf-token'], function (decoded) {
        let decodedJSON = decoded;
        delete decodedJSON.exp;
        delete decodedJSON.iat;
        var token = jwt.sign(decodedJSON, tokenKey, {
            algorithm: 'HS256',
            expiresIn: "1h"
        });
        req.cookies['lf-token'] = token;
        res.cookie('lf-token', token, {
            maxAge: 3600000
        });

        req.cookies['selected-company'] = req.cookies['selected-company'];
        res.cookie('selected-company', req.cookies['selected-company'], {
            maxAge: 3600000
        });
    });
};
function returnRole(req) {
    var decoded = jwt.decode(req.cookies['lf-token']);
    return decoded == undefined ? undefined : decoded['role'];
};
module.exports.returnLfId = function returnlfId(req) {
    var decoded = jwt.decode(req.cookies['lf-token']);
    return decoded == undefined ? undefined : decoded['lf-id'];
};

module.exports.checkRoleWithReq = function checkRoleWithReq(req, role) {
    return checkRole(returnRole(req),role)
};
module.exports.logout = function logout(res) {
    res.clearCookie('lf-token', {
        path: '/'
    });
    res.clearCookie('selected-company', {
        path: '/'
    });
    return res;
};

module.exports.checkRole = checkRole;
module.exports.returnRole = returnRole;
module.exports.lfDecode = lfDecode;