var express = require('express');

var createError = require('http-errors');
var handlebars = require('express-handlebars');
var hbs_sections = require('express-handlebars-sections');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var Handlebars = require('handlebars');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin/admin.route')
var accountRouter = require('./routes/account/account.route')
var categoryRouter = require('./routes/category/category.route')

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
app.use('/admin', adminRouter);
app.use('/account', accountRouter);
app.use('/category', categoryRouter);




// catch 404 and forward to error handler
app.use(function (req, res, next) {
	next(createError(404));
});

app.use(function (req, res) {
	res.render('404', {
		layout: false
	})
});
// default error handler
app.use(function (err, req, res, next) {
	console.error(err.stack);
	res.render('500', {
		layout: false
	})
})
// error handler
app.use(function (err, req, res, next) {
	// set locals, only providing error in development
	res.locals.message = err.message;
	res.locals.error = req.app.get('env') === 'development' ? err : {};

	// render the error page
	res.status(err.status || 500);
	// res.render('error');
});



Handlebars.registerHelper('ifCond', function (v1, v2, options) {
    if (v1 === v2) {
        return options.fn(this);
    }
    return options.inverse(this);
});
Handlebars.registerHelper('ifMoreCond', function (v1, operator, v2, options) {

    switch (operator) {
        case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
        default:
            return options.inverse(this);
    }
});

module.exports = app;
