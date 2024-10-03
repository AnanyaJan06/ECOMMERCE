//Authentication
function isAuthenticate(req,res,next){
    if(req.session.isAuth){
        next();
    }else{
        res.redirect('/login');
    }
}

module.exports=isAuthenticate;