module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    console.log(req.body["url"]);
    cPlayer.play(req.body["url"],!!req.body["url"]).then(() =>{
        res.send();
    }).catch(() =>{
        res.send();
    });
    
}