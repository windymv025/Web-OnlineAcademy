module.exports = (req,res,next) =>{
    if(req.user){
        res.locals.isAuthenticated = true;
        res.locals.user = req.user;
        if(req.user.role ==='admin'){
            res.locals.isAdmin = true;
        }
        if(req.user.role === 'writer'){
            res.locals.isWriter = true;
        }
        if(req.user.role ==='editor'){
            res.locals.isEditor = true;
        }
    }
    next();
}