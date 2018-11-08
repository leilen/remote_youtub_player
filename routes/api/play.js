module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    cPlayer.play().then(() =>{
        res.send();
    }).catch(() =>{
        res.send();
    });
    
}