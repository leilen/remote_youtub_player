module.exports = function(req, res, next, db, log) {
    if (!req.session.roles[0]) {
        var responseData = {
            'code': 403
        };
        res.json(responseData);
        return;
    }
    if (req.body['pid'] == undefined || req.body['diselected'] == undefined || req.body['selected'] == undefined) {
        var responseData = {
            'code': 400
        };
        res.json(responseData);
        return;
    }
    if (req.body['selected'].trim() == '' && req.body['diselected'].trim() == '') {
        var responseData = {
            'code': 200
        };
        res.json(responseData);
        return;
    }
    var diselectedArr = req.body['diselected'].trim().split('@#@#');
    if (diselectedArr.length != 0 && req.body['diselected'].trim() != '') {
        var queryString = 'DELETE FROM likeafamily.lf_role_log WHERE person_id_num = $1 AND lf_role_id_num=ANY($2::INT[]);';
        var param = [req.body['pid'], diselectedArr];
        db.query(queryString, param, function(rows) {
            var selectedArr = req.body['selected'].trim().split('@#@#');
            if (selectedArr.length != 0 && req.body['selected'].trim() != '') {
                queryString = 'INSERT INTO likeafamily.lf_role_log(person_id_num,lf_role_id_num) VALUES';
                for (i in selectedArr) {
                    queryString += '(' + req.body['pid'] + ',' + selectedArr[i].toString() + ')';
                    if (i < selectedArr.length - 1) {
                        queryString += ',';
                    }
                }
                db.query(queryString, [], function(rows) {
                    var responseData = {
                        'code': 200,
                        'data': {}
                    };
                    res.json(responseData);
                }, function(err) {
                    var responseData = {
                        'code': 402,
                        'data': {}
                    };
                    res.json(responseData);
                });
            }else{
                var responseData = {
                        'code': 200,
                        'data': {}
                    };
                    res.json(responseData);
            }
        }, function(err) {
            var responseData = {
                'code': 402,
                'data': {}
            };
            res.json(responseData);
        });
    } else {
        var selectedArr = req.body['selected'].split('@#@#');
        if (selectedArr.length != 0) {
            var queryString = 'INSERT INTO likeafamily.lf_role_log(person_id_num,lf_role_id_num) VALUES';
            for (i in selectedArr) {
                queryString += '(' + req.body['pid'] + ',' + selectedArr[i].toString() + ')';
                if (i < selectedArr.length - 1) {
                    queryString += ',';
                }
            }

            db.query(queryString, [], function(rows) {
                var responseData = {
                    'code': 200,
                    'data': {}
                };
                res.json(responseData);
            }, function(err) {
                var responseData = {
                    'code': 402,
                    'data': {}
                };
                res.json(responseData);
            });
        }
    }
}