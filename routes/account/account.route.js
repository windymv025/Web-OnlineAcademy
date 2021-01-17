const bodyParser = require('body-parser');
const userModel = require('../../models/user.model');

express = require('express');

const bcrypt = require('bcrypt');

const moment = require('moment');

const passport = require('passport')

const auth = require('../../middleware/auth');
const userType = require('../../enum/userType');
const { now } = require('moment');

let router = express.Router();

router.get('/is-available', (req, res, next) => {
    var user = req.query.username;
    userModel.singleByUsername(user).then(rows => {
        if (rows.length > 0) {
            return res.json(false);
        }

        return res.json(true);
    })
});

router.get('/register', (req, res) => {
    res.render('account/register', {
        layout: false
    });
});

router.post('/register', (req, res) => {
    let userByMail = userModel.singleByEmail(req.body.email.trim().toLowerCase()).then((user) => {
        if (user.length > 0){
            res.render('account/register', {
                layout: false,
                errors: 'Email đã được đăng ký, vui lòng chọn email khác'
            });
        } else {
            let saltround = 10;
            let hash = bcrypt.hashSync(req.body.password, saltround);
            let entity = {
                name: req.body.name,
                password: hash,
                email: req.body.email.trim().toLowerCase(),
                type: 2,
                status: 1,
                created_at: now(),
            }

            userModel.add(entity)
                .then(() => res.redirect('/account/login'))
                .catch(err => {
                    console.log(err + "");
                    res.render('account/register', {
                        layout: false
                    });
                })
        }
    })
});

router.get('/login', (req, res) => {
    res.render('account/login', {
        layout: false
    });
})

router.post('/login', function (req, res, next) {
    let rq = req.body
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.render('account/login', {
                layout: false,
                err_message: info.message
            })
        }
        req.logIn(user, function (err) {
            if (err) {
                return next(err);
            }
            return res.redirect('/');
        });
    })(req, res, next);
});


router.post('/logout', auth, (req, res, next) => {
    req.logOut();
    res.redirect('/account/login');
})



router.get('/profile', auth, (req, res, next) => {
    res.end('profile');
})

router.get('/google', passport.authenticate('google', {
    scope: ['profile']
}));

router.get('/google/abc', passport.authenticate('google'), (req, res, next) => {
    req.logIn(req.user, function (err) {
        if (err) {
            return next(err);
        }
        return res.redirect('/');
    });
})
router.get('/profile/:id', auth, (req, res, next) => {
    let id = req.params.id;
    let user = userModel.singleById(id);
    user.then(result => {
        console.log('reuslt-------', result[0]);
        let r = result[0];
        r.dob = moment(new Date(result[0].date_of_birth)).format("YYYY-MM-DD");
        res.render('account/profile', {
            layout: 'main',
            user: r
        });
    }).catch(err => {
        throw err;
    })

});
router.post('/profile/update', auth, (req, res, next) => {
    userModel.singleById(req.body.id).then(result => {
        let user = result[0];
        if (req.body.dob !== '') {
            user.date_of_birth = req.body.dob;
        }
        user.name = req.body.name;
        user.email = req.body.email;
        userModel.update(user).then(result => {
            console.log('result------', result);
            res.redirect(`/account/profile/${req.body.id}`);
        })
    }).catch(err => {
        throw err;
    })

});
router.post('/profile/changepassword', auth, (req, res, nex) => {
    userModel.singleById(req.body.id).then(result => {
        let user = result[0];
        console.log('req.body-------', req.body);
        let ret = bcrypt.compareSync(req.body.password, user.password);
        console.log('ret---------', ret);
        if (ret && req.body.newpassword === req.body.confirmnewpass) {
            let saltround = 10;
            let hash = bcrypt.hashSync(req.body.newpassword, saltround);
            user.password = hash;
            userModel.update(user).then(result => {
                console.log('result-------', result);
                res.redirect(`/account/profile/${req.body.id}`);
            }).catch(err => { throw err; })
        } else {
            res.send('failed');
        }
    }).catch(err => { throw err; })
});
module.exports = router;