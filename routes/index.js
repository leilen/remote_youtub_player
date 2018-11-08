const express = require('express');
const router = express.Router();

const db = require('../custom_modules/db_query');
const crypto = require('../custom_modules/crypto2');
const log = require('../custom_modules/custom_logs');
const auth = require('../custom_modules/auth');
const jwt = require('../custom_modules/custom_jwt');
const cRes = require('../custom_modules/custom_res');

const cPlayer = require('../custom_modules/custom_player');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index');
});

router.post('/api/play',  function(req, res, next) {
    require('./api/play')(req, res, next, db, log, cRes, jwt, cPlayer);
});
router.post('/api/stop',  function(req, res, next) {
    require('./api/stop')(req, res, next, db, log, cRes, jwt, cPlayer);
});

module.exports = router;