module.exports = function (req, res, next, db, crypto, log) {
    var pass = req.query['string'];
    var st = crypto.hash(pass);
    res.send(st);
}