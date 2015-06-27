var express = require('express');
var router = express.Router();

router.route('/').get(function (req, res, next) {

    res.render('lobby');
});

module.exports = router;