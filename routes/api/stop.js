module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    cPlayer.stop(true);
    res.send();
}