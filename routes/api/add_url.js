module.exports = function(req, res, next, db, log, cRes, jwt,cPlayer) {
    if (req.body["title"]){
        if (!req.body["title"] || !req.body["url"]){
            cRes.sendParamErrorJSON(res);
            return;
        }
        cPlayer.addList(req.body["url"],req.body["title"]).then(() =>{
            cRes.sendOKJSON(res);
        })
    }else{
        if (!/^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w\-]+\?v=|embed\/|v\/)?)([\w\-]+)(\S+)?$/.test(req.body["url"])){
            cRes.sendParamErrorJSON(res);
            return;
        }
        cPlayer.addList(req.body["url"]).then(() =>{
            cRes.sendOKJSON(res);
        })
    }
}