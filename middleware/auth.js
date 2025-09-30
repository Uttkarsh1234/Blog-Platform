function requireAuth(req,res,next){
    if(!req.user){
        return res.redirect("/signuppage");
    }
    next();
}

module.exports = requireAuth;