const User = require('../models/user');
const {errorHandler}= require('../helpers/dbErrorHandler') 
const jwt = require('jsonwebtoken');
const expressJwt=require('express-jwt')


exports.signup=(req,res)=>{
    console.log(req.body);
    const user = new User(req.body);
    user.save()
    .then((user)=>{
        user.salt = undefined;
        user.hashed_password=undefined;

        res.json({user});
    })
    .catch((err)=>{

        return res.status(400).json({
        message: errorHandler(err)
        })
    })
};

/*
exports.signin= (req,res)=>{  
    const {email,password}=req.body;
    User.findOne({email}, (err,user)=>{
        if(err || !user){
            res.status(400).json({
                err:"Email doesnt exsist , please signup"
            });
        }      
        
        // if(user &&!user.authenticate(password) || !user && user.authenticate(password)){
        //     return res.status(401).json({
        //         error: 'Email or Password doesnt match'
        //     });
        // }

        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)
        res.cookie('t', {expire: new Date()+9999})

        const { _id, name, email, role } = user;
        return res.json({ token:token, user: { _id, email, name, role } });

    })

};
*/

exports.signin = (req, res) => {
    // find the user based on email
    const { email, password } = req.body;
    User.findOne({ email }, (err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'User with that email does not exist. Please signup'
            });
        }
        if (!user.authenticate(password)) {
            return res.status(401).json({
                error: 'Email and password dont match'
            });
        }
    
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
        
        res.cookie('t', token, { expire: new Date() + 9999 });

        const { _id, name, email, role } = user;
        return res.json({ token, user: { _id, email, name, role } });
    });
};

exports.signout =(req,res,next)=>{

    res.clearCookie('t')

    res.json({
        message:"user signout"
    })
    
    
};

exports.requireSignin  = expressJwt({
    secret: process.env.JWT_SECRET,
    algorithms: ['sha1', 'RS256', 'HS256'],
    userProperty: "auth",
  });

exports.isAuth=(req,res,next)=>{
    let user = req.profile && req.auth && req.profile._id == req.auth._id;

    if(!user){
        return res.status(403).json({
            error:"access denied"
        });
    }

    next();

};


exports.isAdmin = (req,res,next)=>{
    if(req.profile.role === 0){
        return res.status(403).json({
            error: 'Admin resourse! Access denied'
        });
    }
    next();
}
