var express = require('express');

var createError = require('http-errors');
var handlebars = require('express-handlebars');
var hbs_sections = require('express-handlebars-sections');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

var server = app.listen(8000, function () {
	var host = server.address().address == '::' ? '127.0.0.1' : server.address().address
	var port = server.address().port
	console.log("Ung dung Node.js dang hoat dong tai dia chi: http://%s:%s", host, port)
});

// view engine setup
app.engine('hbs', handlebars({ extname: '.hbs' }));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Route app
app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	// res.render('error');
});

module.exports = app;
