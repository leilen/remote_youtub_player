module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    let returnJSON = {
        "url-list" : cPlayer.getUrlList(),
        "is-playing" : cPlayer.returnIsPlaying(),
        "play-status" : cPlayer.returnPlayConfig()
    }
    res.json(returnJSON);
}