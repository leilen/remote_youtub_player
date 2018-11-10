module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    cPlayer.deleteList(req.body["url"]);
    res.send();
}