module.exports = function (req, res, next, db, log, cRes, jwt) {
    var data = {};
    var date;
    if (req.query['m'] == undefined || req.query['y'] == undefined) {
        date = new Date();
    } else {
        date = new Date(req.query['y'] + '-' + (parseInt(req.query['m'])) + '-1');
    }
    var startDay = new Date(date.getFullYear(), date.getMonth(), 1);
    var endDay = new Date(date.getFullYear(), date.getMonth() + 1, 1);

    var startDate = startDay.getFullYear() + '-' + (parseInt(startDay.getMonth()) + 1 < 10 ? '0' + (parseInt(startDay.getMonth()) + 1) : (parseInt(startDay.getMonth()) + 1)) + '-01';
    var endDate = endDay.getFullYear() + '-' + (parseInt(endDay.getMonth()) + 1 < 10 ? '0' + (parseInt(endDay.getMonth()) + 1) : (parseInt(endDay.getMonth()) + 1)) + '-01';
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
    var queryString = 
        `SELECT
            EXISTS(SELECT 1 FROM likeafamily.person_company WHERE person_id_num = $1 AND company_id_num = $4) AS "is-company",
            (SELECT COALESCE(JSON_AGG(sub),'[]') FROM(SELECT id_num AS "id", name AS "text" FROM likeafamily.rest_type WHERE company_id_num = $4 ORDER BY id_num) AS sub) AS "rest-type-arr",
            COALESCE(
                (SELECT 
                    is_attendance 
                FROM likeafamily.attendance_log 
                WHERE person_id_num = $1 
                AND company_id_num = $4
                AND date_time::DATE = CURRENT_DATE 
                ORDER BY date_time DESC 
                LIMIT 1),
                COALESCE((
                    SELECT 
                        is_attendance 
                    FROM likeafamily.attendance_log 
                    WHERE person_id_num = $1 
                    AND company_id_num = $4
                    AND date_time::DATE = (CURRENT_DATE - INTERVAL '1 DAY') 
                    ORDER BY date_time DESC 
                    LIMIT 1),FALSE)
            ) AS "is-attendance",
            COALESCE((SELECT
                JSON_AGG(rest)
            FROM
                 (SELECT
                     rl.id_num AS "id",
                      rt.name AS "type",
                     p.nick_name AS "nick-name",
                     rl.target_date AS "date",
                     rl.target_time_range AS "time-range",
                     rl.description AS "description"
                FROM likeafamily.rest_log AS rl
                JOIN likeafamily.rest_type AS rt
                ON rt.id_num = rl.type
                JOIN likeafamily.person AS p
                ON p.id_num = rl.person_id_num
                JOIN likeafamily.person_company AS pc
                ON p.id_num = pc.person_id_num
                WHERE pc.company_id_num = $4
                AND delete_person_id_num IS NULL
                AND rt.company_id_num = $4
                AND (target_date = CURRENT_DATE
                OR (target_end_date IS NOT NULL AND (target_date <= CURRENT_DATE AND CURRENT_DATE <= target_end_date)))
                ORDER BY rl.id_num) AS rest
            ),'[]') AS "rest",
            COALESCE((
                SELECT
                    JSON_AGG(sub)
                FROM
                    (SELECT
                        al.id_num AS "id",
                        al.is_attendance AS "is-attendance",
                        p.nick_name AS "nick-name",
                        al."time" AS "time"
                    FROM
                        ((SELECT
                             id_num,
                             is_attendance,
                             person_id_num,
                             date_time,
                             TO_CHAR(date_time,'HH24:MI') AS "time"
                        FROM likeafamily.attendance_log
                        WHERE date_time::DATE = CURRENT_DATE
                        AND company_id_num = $4)
                        UNION ALL
                        (SELECT
                             id_num,
                             is_attendance,
                             person_id_num,
                             date_time,
                            TO_CHAR(date_time,'어제 HH24:MI') AS "time"
                        FROM
                            (SELECT
                                DISTINCT ON (person_id_num)
                                *
                            FROM likeafamily.attendance_log
                            WHERE date_time::DATE = CURRENT_DATE - INTERVAL '1 DAY'
                            AND company_id_num = $4
                            ORDER BY person_id_num ,date_time DESC) AS sub
                        WHERE sub.is_attendance)) AS "al"
                    JOIN likeafamily.person AS p
                    ON p.id_num = al.person_id_num
                    ORDER BY al.date_time
                ) AS sub
            ),'[]') AS "attendance",
            COALESCE((SELECT
                JSON_AGG(sub)
            FROM
                (SELECT
                    p.nick_name AS "nick-name"
                FROM likeafamily.person AS p
                JOIN likeafamily.lf_role_log AS lrl
                ON lrl.lf_role_id_num = 1
                AND lrl.person_id_num = p.id_num
                JOIN likeafamily.person_company AS pc
                ON p.id_num = pc.person_id_num
                WHERE pc.company_id_num = $4
                ORDER BY p.id_num
                ) AS sub
            ),'[]') AS "all-person",
            COALESCE((SELECT
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
                ORDER BY rl.target_date) AS sub),'[]') AS "date-data"
        FROM likeafamily.attendance_log`;
    var params = [jwt.returnLfId(req), startDate, endDate, selectedCompany];
    db.query(queryString, params, function (rows) {
        data = rows[0];
        if (!data["is-company"]){
            cRes.sendForbiddenJSON(res);
            return;
        }

        var sideIndex = { 'x': 0, 'y': 0 };
        cRes.sendOKJSON(res,{ 'data': data, 'sideIndex': sideIndex })
    });
}
