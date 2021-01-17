const passport = require('passport')
const userModel = require('../models/user.model')
const bcrypt = require('bcrypt');
const LocalStrategy = require('passport-local').Strategy

module.exports = (app) => {
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use('local', new LocalStrategy({
        usernameField: 'email',
        passwordField: 'password'
    },
        function (usernameField, password, done) {
            let email = usernameField;
            userModel.singleByEmail(email)
                .then(rows => {
                    if (rows.length === 0) {
                        return done(null, false, { message: 'Email không tồn tại' });
                    }
                    let user = rows[0];
                    let ret = bcrypt.compareSync(password, user.password);
                    if (ret) {
                        if (user.status == 1) {
                            return done(null, user);
                        }
                        return done(null, false, { message: 'Tài khoản bị khóa' });
                    }
                    return done(null, false, { message: 'Email hoặc mật khẩu không đúng' })
                })
                .catch(err => {
                    return done(err, false);
                })
        }));

    passport.serializeUser((user, done) => {
        return done(null, user);
    });

    passport.deserializeUser((user, done) => {
        return done(null, user);
    });

}