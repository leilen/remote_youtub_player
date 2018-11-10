module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    if (req.body["vol"] == undefined){
        cRes.sendParamErrorJSON(res);
        return;
    }
    cPlayer.setvolume(req.body["vol"]);
    cRes.sendOKJSON(res);
}