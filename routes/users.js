// login
exports.login = function (req, res, next) {

    var username = req.body.user,
        pass = req.body.pass,
        User = require('../models/user_model').User;

    if (username === '' || pass === '') {
        req.session.error = ["Username/password can't be empty"];
        res.redirect('/');
    }
    else {

        User.findOne({username: username}, function (err, user) {

            var to = '/'; // redirect(to);

            if (err)
                console.log(err);
            else if (user === null)
                req.session.error = ['Username do not exists'];
            else {

                // compare passwords
                if (user.comparePassword(pass)) {

                    // save user in session
                    req.session.logged = true;
                    req.session.username = user.username;
                    to = '/lobby';
                }
                else
                    req.session.error = ['Wrong password'];
            }

            res.redirect(to);
        });
    }
};

// registration
exports.register = function (req, res, next) {

    var username = req.body.username,
        password = req.body.password,
        password2 = req.body.password2;

    req.session.error = [];

    // basic verifications
    if (password == '')
        req.session.error.push('Password can\'t by empty');
    if (password != password2)
        req.session.error.push('Passwords do not match');
    if (username == '')
        req.session.error.push('Username can\'t empty');

    // try to save in db
    if (req.session.error.length === 0) {

        var md5 = require('crypto-md5');
        var User = require('../models/user_model').User;

        var new_user = new User({
            username: username,
            password: md5(password)
        });

        new_user.save(function (error, user) {
            if (error) {
                if (error.code === 11000) {

                    req.session.error.push("Username '" + username + "' already exists");
                    res.redirect('/');
                }
                else
                    console.log(error);
            }
            else {

                req.session.success = ["Registration successful! You can now login."];
                res.redirect('/');
            }
        });
    }
    else
        res.redirect('/');
};

exports.logout = function(req, res, next) {
    req.session.logged = false;
    req.session.success = ["You've been logged out."];
    res.redirect('/');
};