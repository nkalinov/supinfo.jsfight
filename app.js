var express = require('express'),
    path = require('path'),
    logger = require('morgan'),
    session = require('express-session'),
    sessionStore = new session.MemoryStore(),
    sessionSecret = 'shhhh, very secret',
    sessionMiddleware = session({
        store: sessionStore,
        resave: false, // don't save session if unmodified
        saveUninitialized: false, // don't create session until something stored
        secret: sessionSecret
    }),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),

    users = require('./routes/users'),

    app = express();

// default title
app.locals.title = 'SupFighter';

// global connection and helpers
global.db = require('./models/getMongoose').mongoose;
global.helpers = require('./helpers').helpers;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json()); // parse application/json
app.use(bodyParser.urlencoded({extended: false})); // parse application/x-www-form-urlencoded
app.use(cookieParser(sessionSecret));
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(sessionMiddleware);

// Status message middleware
app.use(function (req, res, next) {
    var err = req.session.error;
    var msg = req.session.success;
    delete req.session.error;
    delete req.session.success;

    if (err)
        res.locals.error = err;
    if (msg)
        res.locals.success = msg;

    // for use in templates
    if(req.session.logged) {
        res.locals.username = req.session.username;
        res.locals.logged = req.session.logged;
    }

    next();
});

// routes
app.use('/', require('./routes/index'));
app.use('/login', users.login);
app.use('/logout', users.logout);
app.use('/registration', users.register);
app.use('/lobby', helpers.only_logged, require('./routes/lobby'));
app.use('/game/:room', helpers.only_logged, require('./routes/game'));
app.use('/game/:room/:status/:username', helpers.only_logged, require('./routes/game'));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = exports = app;
exports.sessionMiddleware = sessionMiddleware;