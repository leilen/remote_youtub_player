module.exports = function (req, res, next, db, log, cRes , jwt) {
    var data = {};
    if (req.query['m'] == undefined || req.query['y'] == undefined) {
        cRes.sendParamErrorJSON(res);
        return;
    }
    var startDay = new Date(req.query['y'], req.query['m'] - 1, 1);
    var endDay = new Date(startDay.getFullYear(), parseInt(startDay.getMonth()) + 1, 1);

    var startDate = startDay.getFullYear() + '-' + (parseInt(startDay.getMonth() + 1)< 10 ? '0' + (parseInt(startDay.getMonth() + 1)) : (parseInt(startDay.getMonth() + 1))) + '-01';
    var endDate = endDay.getFullYear() + '-' + (parseInt(endDay.getMonth() + 1) < 10 ? '0' + (parseInt(endDay.getMonth() + 1)) : (parseInt(endDay.getMonth() + 1))) + '-01';
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
    var queryString = `
        SELECT
            COALESCE((
                SELECT
                    JSON_AGG(sub)
                FROM
                    (SELECT
                        rl.id_num AS "id",
                        p.nick_name::TEXT||'님 - '||rt.name AS "title",
                        '#' || rt.color AS "color",
                        TO_CHAR(rl.target_date,'YYYY-MM-DD') AS "start",
                        COALESCE(TO_CHAR(rl.target_end_date,'YYYY-MM-DD 23:59:59'),TO_CHAR(rl.target_date,'YYYY-MM-DD')) AS "end",
                        ($1 = rl.person_id_num) AS "is-mine",
                        rl.target_time_range AS "time-range",
                        rl.description AS "description"
                    FROM likeafamily.rest_log AS rl
                    JOIN likeafamily.rest_type AS rt
                    ON rt.id_num = rl.type
                    JOIN likeafamily.person AS p
                    ON p.id_num = rl.person_id_num
                    WHERE rl.delete_person_id_num IS NULL
                    AND rt.company_id_num = $4
                    AND (
                        (TO_DATE($2,'YYYY-MM-DD') <= rl.target_date AND rl.target_date <= TO_DATE($3,'YYYY-MM-DD')) OR
                        (TO_DATE($2,'YYYY-MM-DD') <= COALESCE(rl.target_end_date,rl.target_date) AND COALESCE(rl.target_end_date,rl.target_date) <= TO_DATE($3,'YYYY-MM-DD')) OR
                        (TO_DATE($2,'YYYY-MM-DD') > rl.target_date AND COALESCE(rl.target_end_date,rl.target_date) > TO_DATE($3,'YYYY-MM-DD'))
                    )
                    ORDER BY rl.target_date) AS sub),'[]')`;
    var params = [jwt.returnLfId(req), startDate, endDate, selectedCompany];
    db.query(queryString, params, function (rows) {
        data = rows[0];
        cRes.sendOKJSON(res,rows[0]['coalesce'])
        return;
    });
}
