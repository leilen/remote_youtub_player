module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    console.log(req.body);
    if (req.body["vol"] == undefined){
        cRes.sendParamErrorJSON(res);
        return;
    }
    cPlayer.setVolumn(req.body["vol"]);
    cRes.sendOKJSON(res);
}