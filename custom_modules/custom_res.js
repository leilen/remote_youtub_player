module.exports.sendForbiddenJSON =  function(res) {
    res.statusCode = 403;
    res.json({});
};
module.exports.send404JSON =  function(res) {
    res.statusCode = 404;
    res.json({});
};
module.exports.sendDBErrorJSON = function(res) {
    res.statusCode = 402;
    res.json({});
};
module.exports.sendParamErrorJSON = function(res) {
    res.statusCode = 400;
    res.json({});
};
module.exports.sendOKJSON = function(res,data={},code=200) {
    res.statusCode = code;
    res.json(data == undefined ? {} : data);
};

module.exports.sendErrorJSON = function(res,code) {
    res.statusCode = code;
    res.json({});
};