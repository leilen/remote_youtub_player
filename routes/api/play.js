module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    cPlayer.play(req.body["url"]).then(() =>{
        res.send();
    }).catch(() =>{
        res.send();
    });
}