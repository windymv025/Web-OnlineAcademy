var exphbs = require('express-handlebars');
var hbs_sections = require('express-handlebars-sections');
module.exports = function (app) {
    app.engine('handlebars', exphbs({
        defaultLayout: 'main',
        layoutsDir: 'views/layouts',
        helpers: {
            section: hbs_sections()
        }
    }));
    app.set('view engine', 'handlebars');
}