var express = require('express');
var router = express.Router();

router.route('/').get(function (req, res, next) {
    if(req.session.logged)
        res.redirect('/lobby');
    else
        res.render('index');
});

module.exports = router;