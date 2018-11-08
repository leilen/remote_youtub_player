module.exports = function (req, res, next, db, log, cRes, jwt) {
    var data = {};

    var queryString = `
        SELECT
            p.id_num AS "id",
            p.nick_name AS "text"
        FROM likeafamily.person AS p
        JOIN likeafamily.person_company AS pc
        ON pc.person_id_num = p.id_num
        WHERE pc.company_id_num = $1
        ORDER BY p.id_num`;
    var params = [];
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
    params.push(selectedCompany);
    db.query(queryString, params, function (rows) {
        cRes.sendOKJSON(res,rows)
        return;
    }, function (err) {
        cRes.sendDBErrorJSON(res);
        return;
    });
}
