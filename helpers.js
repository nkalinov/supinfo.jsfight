Helpers = {

    only_logged: function (req, res, next) {
        if (!req.session.logged) {
            req.session.error = ["You must be logged in to see this page"];
            res.redirect('/');
        } else {
            next();
        }
    }
}
;

exports.helpers = Helpers;