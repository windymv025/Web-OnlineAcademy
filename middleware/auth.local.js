const userType = require("../enum/userType");

module.exports = (req, res, next) => {
    if (req.user) {
        res.locals.isAuthenticated = true;
        res.locals.user = req.user;
        if (req.user.type === userType.ADMIN()) {
            res.locals.isAdmin = true;
        }
        if (req.user.type === userType.LECTURE()) {
            res.locals.lecture = true;
        }
        if (req.user.type === userType.NORMAL()) {
            res.locals.student = true;
        }
    }
    next();
}