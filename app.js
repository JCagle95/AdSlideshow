var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var adminRouter = require('./routes/administration');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// Login / Sessions
var env = process.env.NODE_ENV || 'development'
if (env == 'development') {
  app.set('mongodb', 'mongodb://localhost:27017/adslideshow');
  app.set('database', 'adslideshow');
  app.use(session({
    secret: 'thisisjustatestingproject',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
} else {
  app.set('mongodb', process.env.MONGODB_URI);
  app.set('database', 'scraperviewer');
  app.use(session({
    secret: 'thisisjustatestingproject',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }));
}

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/administration', adminRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
