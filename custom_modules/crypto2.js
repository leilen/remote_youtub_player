/**
 * Created by sanghwan on 2017. 3. 5..
 */
var crypto = require('crypto');
var moment = require('moment');
var config = require('./../config/config.json');

var SaltLength = config.saltlength;

//비밀번호 해쉬
function createHash(password) {
    var salt = generateSalt(SaltLength);
    var hash = hashed(password + salt);
    return salt + hash;
}
//비밀번호 검증
function validateHash(hash, password) {
    var salt = hash.substr(0, SaltLength);
    var validHash = salt + hashed(password + salt);
    return hash === validHash;
}

function generateSalt(len) {
    var set = config.pw_iv,
        setLen = set.length,
        salt = '';
    for (var i = 0; i < len; i++) {
        var p = Math.floor(Math.random() * setLen);
        salt += set[p];
    }
    return salt;
}

function hashed(string) {
    return crypto.createHash(config.pw_algorithm).update(string).digest(config.digest);
}
//복호화 가능 암호
function generateHash(code) {
    if (!isString(code)) {
        code = code.toString();
    }
    /* 알고리즘과 암호화 key 값으로 셋팅된 클래스를 뱉는다 */
    var cipher = crypto.createCipher(config.algorithm, config.iv);

    /* 컨텐츠를 뱉고 */
    var encipheredContent = cipher.update(code, 'utf8', config.digest);

    /* 최종 아웃풋을 hex 형태로 뱉게 한다*/
    encipheredContent += cipher.final(config.digest);

    return encipheredContent;
}
//복호화
function decipherFunc(text) {
    try {
        var decipher = crypto.createDecipher(config.algorithm, config.iv);

        var decipheredPlaintext = decipher.update(text, config.digest, 'utf8');

        decipheredPlaintext += decipher.final('utf8');
    } catch (e) {
        return null;
    }

    return decipheredPlaintext;
}


function validPassword(password, hashpassword) {
    var inputpassword = generateHash(password);
    if (inputpassword == hashpassword) {
        return true;
    } else {
        return false;
    }
}
function randomString(length, chars) {
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function maketemppw() {
    return randomString(3, '0123456789') + randomString(3, 'abcdefghijklmnopqrstuvwxyz');
}

function isString(value) {
    return typeof value === 'string';
}

module.exports = {
    'hash': createHash,
    'validate': validateHash
};

module.exports.generateHash = generateHash;
module.exports.decipherFunc = decipherFunc;
module.exports.validPassword = validPassword;
module.exports.maketemppw = maketemppw;