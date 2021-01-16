var express = require('express');

var createError = require('http-errors');
var handlebars = require('express-handlebars');
var hbs_sections = require('express-handlebars-sections');

var path = require('path');
var morgan = require('morgan');
var Handlebars = require('handlebars');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var adminRouter = require('./routes/admin/admin.route')
var homeRouter = require('./routes/user/home.route')
var accountRouter = require('./routes/account/account.route')
var categoryRouter = require('./routes/category/category.route')
const viewEngine = require('./middleware/viewEngine')
const session = require('./middleware/session')
const passport = require('./middleware/passport');
const userType = require('./enum/userType');
const categoryModel = require('./models/category.model');

var app = express();


viewEngine(app)
app.set('views', path.join(__dirname, 'views'));
session(app)
passport(app)

app.use(require('./middleware/auth.local'));
var server = app.listen(5000, function () {
    var host = server.address().address == '::' ? '127.0.0.1' : server.address().address
    var port = server.address().port
    console.log("Ung dung Node.js dang hoat dong tai dia chi: http://%s:%s", host, port)
});

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(path.join(__dirname, 'public')));


//App route

app.get('/', function (req, res, next) {
    categoryModel.allParent().then((pC) => {
        let pCat = pC
        let pChildCat = []
        pCat.forEach(e => {
            pChildCat.push(categoryModel.childByParentId(e.id))
        });

        Promise.all(pChildCat).then((cat) => {
            if (cat) {
                pCat.map((p, index) => {
                    let childs = []
                    cat[index].forEach(e => {
                        if (e.parent_category_id = p.id) {
                            childs.push(e)
                        }
                    })
                    return p.childs = childs;
                })
            }
            app.locals.cats = pCat
        })
    })
    if (req.isAuthenticated()) {
        if (Number(req.user.type) == userType.ADMIN()) {
            res.redirect('admin');
        } else {
            res.redirect('home');
        }
    } else {
        res.redirect('home')
    }
});

app.use('/admin', adminRouter);
app.use('/home', homeRouter);
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

Handlebars.registerHelper('page', function (n, block) {
    var accum = '';
    for (var i = 1; i <= n; ++i)
        accum += block.fn(i);
    return accum;
});

Handlebars.registerHelper('for', function (from, to, incr, block) {
    var accum = '';
    for (var i = from; i < to; i += incr)
        accum += block.fn(i);
    return accum;
});

Handlebars.registerHelper('prevPage', function (from, to, incr, block) {
    var accum = '';
    for (var i = from; i < to; i += incr)
        accum += block.fn(i);
    return accum;
});

Handlebars.registerHelper('nextPage', function (from, to, incr, block) {
    var accum = '';
    for (var i = from + 1; i <= to; i += incr)
        accum += block.fn(i);
    return accum;
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
