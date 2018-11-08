/**
 * Created by sanghwan on 2017. 3. 7..
 */
var config = require('../config/config.json');
var pg = require('pg');
var pool = new pg.Pool(config.db_config);

exports.query = function(query, params, callback){
    pool.connect(function (err, client, done) {
        if (err) {
            done();
            console.log('db connect err : ' + err);
            callback(err);
        } else {
            client.query(query, params, function (err, result) {
                done();
                if (err) {
                    console.log('db query err : ' + err)
                    callback(err);
                } else {
                    callback(result.rows);
                }
            })
        }
    });
};

exports.query = function(query, params, callback, errCallBack){
    pool.connect(function (err, client, done) {
        if (err) {
            done();
            console.log('db connect err : ' + err);
            if (errCallBack != undefined){
                errCallBack(err);
            }
        } else {
            client.query(query, params, function (err, result) {
                done();
                if (err) {
                    console.log('db query err : ' + err)
                    if (errCallBack != undefined){
                        errCallBack(err);
                    }
                } else {
                    callback(result.rows);
                }
            })
        }
    });
};

