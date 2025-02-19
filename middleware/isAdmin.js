const userType = require("../enum/userType");

module.exports = (req, res, next) => {
    if (!req.user) {
        res.redirect('/account/login');
        return;
    } else {
        if (Number(req.user.type) !== userType.ADMIN()) {
            res.redirect('/');
            return;
        }
    }
    next();
}