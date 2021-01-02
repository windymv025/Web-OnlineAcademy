const userType = require("../enum/userType");

module.exports = (req, res, next) => {
    console.log("is admin", req);
    if (!req.user) {
        res.redirect('/account/login');
        return;
    }
    else {
        if (req.user.type !== userType.ADMIN) {
            res.redirect('/');
            return;
        }
    }
    next();
}