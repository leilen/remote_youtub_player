module.exports = function(req, res, next, db, log, cRes, jwt) {
    if (!jwt.checkRoleWithReq(req,0)){
        cRes.sendForbiddenJSON(res);
        return;
    }
    var data = {};
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
    var queryString = `
    SELECT
        COALESCE((
            SELECT
                JSON_AGG(sub)
            FROM (
                SELECT
                    id_num,
                    name
                FROM likeafamily.department AS d
                WHERE d.company_id_num = $1
                ORDER BY id_num
            ) AS sub
        ),'[]') AS "department",
        COALESCE((
            SELECT
                JSON_AGG(sub)
              FROM (
                SELECT
                    id_num,
                    name
                FROM likeafamily.lf_role
                ORDER BY id_num
            ) AS sub
        ),'[]') AS "priv"`;
    db.query(queryString, [selectedCompany], function(rows) {
        data = rows[0];
        var sideIndex = {
            'x': 100,
            'y': 0
        };
        data['auth'] = req.session.roles;
        cRes.sendOKJSON(res,{
            'data': data,
            'sideIndex': sideIndex
        });
    }, function(err) {

    });
};