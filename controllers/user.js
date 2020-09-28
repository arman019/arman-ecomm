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


exports.signin= (req,res)=>{  
    const {email,password}=req.body;
    User.findOne({email}, (err,user)=>{
        if(err || !user){
            res.status(400).json({
                err:"Email doesnt exsist , please signup"
            });
        }      
        
        if(!user.authenticate(password)){
            return res.status(401).json({
                email:user.email,
                error: 'Password doesnt match'
            });
        }

        const token = jwt.sign({_id:user._id}, process.env.JWT_SECRET)
        res.cookie('t', {expire: new Date()+9999})

        const { _id, name, email, role } = user;
        return res.json({ token:token, user: { _id, email, name, role } });

    })

};

exports.signout =(req,res,next)=>{

    res.clearCookie('t')

    res.json({
        message:"user signout"
    })
    
    
}