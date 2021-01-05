session = require('express-session');
module.exports = (app)=>{
    app.use(session({
        secret: 'keyboard cat',
        resave: true,
        saveUninitialized: true,
    }))
}
