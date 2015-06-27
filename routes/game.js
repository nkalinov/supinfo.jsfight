var express = require('express');
var router = express.Router();

router.route('/').get(function (req, res, next) {

    // url parameters
    var split = req.baseUrl.split('/');
    var invite_socket_id = split[2];
    var accept = split[3] || false;
    var invite_username = split[4];

    if(accept != false)
        accept = true;

    res.render('game', {invite_user: invite_socket_id, invite_accept: accept, invite_username: invite_username});
});

module.exports = router;