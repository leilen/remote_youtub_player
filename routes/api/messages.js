module.exports = function(req, res, next, db, log, cRes, jwt) {
    const lfId = jwt.returnLfId(req);
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
    var queryString = `
    SELECT
        ad.id_num AS "id-num",
        TO_CHAR(ad.date_time,'YY.MM.DD HH24:MI') AS "date-time",
        '0' AS "type",
        p.nick_name AS "requester",
        ad.is_used AS "status"
    FROM likeafamily.attendace_delegation AS ad
    JOIN likeafamily.person AS p
    ON p.id_num = ad.from_person_id_num
    JOIN likeafamily.person_company AS pc
    ON pc.person_id_num = p.id_num
    WHERE ad.to_person_id_num = $1
    AND pc.company_id_num = $2
    ORDER BY ad.id_num DESC`;
    var params = [lfId,selectedCompany];
    db.query(queryString, params, function(rows) {
        var sideIndex = {
            'x': 1,
            'y': 0
        };
        cRes.sendOKJSON(res,{
            'data': rows,
            'sideIndex': sideIndex
        });
    });
}