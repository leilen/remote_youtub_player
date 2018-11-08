module.exports = function (req, res, next,log, cRes, jwt) {
    log.log(req,'log out',[]);
    jwt.logout(res);
    cRes.sendOKJSON(res,{});
}