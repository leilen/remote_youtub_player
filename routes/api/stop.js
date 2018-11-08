module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    cPlayer.stop().then(() =>{
        res.send();
    }).catch(() =>{
        res.send();
    });
}