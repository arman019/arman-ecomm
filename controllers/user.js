const User = require('../models/user');
const {errorHandler}= require('../helpers/dbErrorHandler') 

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
}