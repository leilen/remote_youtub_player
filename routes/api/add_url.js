module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    // if (!/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(req.body["url"])){
    //     cRes.sendParamErrorJSON(res);
    //     return;
    // }
    cPlayer.addList(req.body["url"]).then(() =>{
        cRes.sendOKJSON(res);
    })
}