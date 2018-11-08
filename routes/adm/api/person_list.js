module.exports = function(req, res, next, db, log, cRes, jwt) {
    var data = {};
    const selectedCompany = req.cookies['selected-company'] ? req.cookies['selected-company'] : -1;
    var queryString = `
        SELECT
            p.id_num AS "id-num",
            p.id AS "id",
            p.name AS "name",
            p.nick_name AS "nick-name",
            CASE WHEN p.sex THEN '남자'ELSE '여자' END  AS "sex",
            TO_CHAR(pc.join_date , 'YY.MM.DD') AS "join-date",
            priv.string_agg AS "priv",
            department.string_agg AS "department"
        FROM likeafamily.person AS p
        JOIN likeafamily.person_company AS pc
        ON pc.person_id_num = p.id_num
        LEFT JOIN
            (SELECT
                person_id_num,
                string_agg(lr.name::TEXT, ','::TEXT ORDER BY lrl.lf_role_id_num)
            FROM likeafamily.lf_role_log AS lrl
            JOIN likeafamily.lf_role  AS lr
            ON lr.id_num = lrl.lf_role_id_num
            WHERE lrl.company_id_num = $1
            GROUP BY person_id_num
            ) AS priv
        ON priv.person_id_num = p.id_num
        LEFT JOIN
        (SELECT
                person_id_num,
                string_agg(d.name::TEXT, ','::TEXT ORDER BY pd.department_id_num)
            FROM likeafamily.person_department AS pd
            JOIN likeafamily.department  AS d
            ON d.id_num = pd.department_id_num
            WHERE d.company_id_num = $1
            GROUP BY person_id_num
            ) AS department
        ON department.person_id_num = p.id_num
        WHERE pc.company_id_num = $1`;
    var params = [selectedCompany];
    db.query(queryString, params, function(rows) {
        cRes.sendOKJSON(res,rows);
    });
}